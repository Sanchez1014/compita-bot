// ===============================
// COMPITA — SISTEMA PROFESIONAL
// ===============================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');

// Importar sistema REAL de owners
const { isOwner } = require('./config');

// Módulos del sistema
const { generateKey, checkOwnerPermission, listKeys } = require('./modules/keys');
const { activarKeyEnGrupo } = require('./modules/activateKey');
const {
    isGroupActive,
    getGroupRent,
    listRents,
    extendGroupRent
} = require('./modules/rent');
const { getChatConfig, setChatConfig } = require('./modules/config');
const { isAdminInGroup, containsLink, checkFlood } = require('./modules/moderation');

// ===============================
// INICIO DE SESIÓN
// ===============================
async function startCompita() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: P({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // ===============================
    // RECONEXIÓN AUTOMÁTICA
    // ===============================
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason === DisconnectReason.loggedOut) {
                console.log('❌ Sesión cerrada. Borra la carpeta auth y vuelve a escanear.');
            } else {
                console.log('♻️ Reconectando Compita...');
                startCompita();
            }
        }

        if (connection === 'open') {
            console.log('✅ COMPITA — ONLINE');
        }
    });
// ===============================
// .jid — Muestra tu JID real
// ===============================
if (cmd === 'jid') {
    return sock.sendMessage(from, {
        text: `Tu JID real es:\n${sender}`
    });
}
    // ===============================
    // MENSAJES
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            '';
        if (!body) return;

        const isGroup = from.endsWith('@g.us');

        // ===============================
        // ANTI-LINK / ANTI-FLOOD
        // ===============================
        if (isGroup) {
            const groupMetadata = await sock.groupMetadata(from);
            const myId = sock.user.id;
            const cfg = getChatConfig(from);

            // ANTI-LINK
            if (cfg.antilink && containsLink(body)) {
                const iAmAdmin = isAdminInGroup(groupMetadata.participants, myId);
                if (iAmAdmin) {
                    await sock.sendMessage(from, {
                        text: '🚫 Enlaces no permitidos en este grupo.'
                    });
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                }
            }

            // ANTI-FLOOD
            if (cfg.antiflood) {
                const isFlood = checkFlood(
                    from,
                    sender,
                    cfg.maxFloodMessages || 5,
                    cfg.floodIntervalMs || 5000
                );
                if (isFlood) {
                    const iAmAdmin = isAdminInGroup(groupMetadata.participants, myId);
                    if (iAmAdmin) {
                        await sock.sendMessage(from, {
                            text: '🚫 Flood detectado, usuario expulsado.'
                        });
                        await sock.groupParticipantsUpdate(from, [sender], 'remove');
                    }
                }
            }
        }

        // ===============================
        // COMANDOS
        // ===============================
        if (!body.startsWith('.')) return;

        const args = body.trim().split(/\s+/);
        const cmd = args.shift().slice(1).toLowerCase();

        // Comandos que funcionan sin renta
        const freeCommands = ['activar', 'hola', 'menu', 'help', 'ayuda', 'mi-plan'];

        // BLOQUEO POR RENTA PARA GRUPO
        if (isGroup && !freeCommands.includes(cmd)) {
            const activo = isGroupActive(from);
            if (!activo) {
                return sock.sendMessage(from, {
                    text:
`⚠️ *Este grupo no tiene una renta activa.*

Pide una KEY a tu proveedor y usa:
\`.activar TU-KEY\``
                });
            }
        }

        // SISTEMA REAL DE OWNERS
        const isOwnerUser = isOwner(sender);

        // ===============================
        // .genkey
        // ===============================
        if (cmd === 'genkey') {
            const password = args[0];
            const daysArg = args[1];
            const plan = (args[2] || 'BASIC').toUpperCase();

            if (!checkOwnerPermission(sender, password)) {
                return sock.sendMessage(from, {
                    text: '❌ No tienes permisos o el password es incorrecto.'
                });
            }

            const days = parseInt(daysArg);
            if (isNaN(days) || days <= 0) {
                return sock.sendMessage(from, {
                    text:
`❌ Días inválidos.

Uso correcto:
.genkey CARNITASM 30 PRO`
                });
            }

            const { key, data } = generateKey(plan, days);

            return sock.sendMessage(from, {
                text:
`🔑 *KEY GENERADA – COMPITA*

Key: ${key}
Plan: ${plan}
Días: ${days}
Creada: ${new Date(data.createdAt).toISOString().slice(0, 19).replace('T', ' ')}

📌 Entrega esta key al cliente y dile:
1) Agrega a Compita a su grupo
2) Use: .activar ${key}`
            });
        }

        // ===============================
        // .activar
        // ===============================
        if (cmd === 'activar') {
            const key = args[0];
            return activarKeyEnGrupo(sock, from, sender, key);
        }

        // ===============================
        // .mi-plan
        // ===============================
        if (cmd === 'mi-plan') {
            if (!isGroup) {
                return sock.sendMessage(from, {
                    text: 'ℹ️ Usa este comando dentro del grupo donde está Compita.'
                });
            }
            const r = getGroupRent(from);
            if (!r) {
                return sock.sendMessage(from, {
                    text: '❌ Este grupo no tiene una renta activa.'
                });
            }
            return sock.sendMessage(from, {
                text:
`📦 *PLAN DE ESTE GRUPO*

Plan: ${r.plan}
Activo: ${isGroupActive(from) ? 'Sí' : 'No'}
Key: ${r.key}
Expira: ${r.expiresAt ? r.expiresAt : 'Sin fecha'}`
            });
        }

        // ===============================
        // .keys (solo owner)
        // ===============================
        if (cmd === 'keys') {
            if (!isOwnerUser) {
                return sock.sendMessage(from, { text: '❌ Solo el owner puede ver las keys.' });
            }
            const list = listKeys(20);
            if (!list.length) {
                return sock.sendMessage(from, { text: 'ℹ️ No hay keys registradas.' });
            }
            let txt = '🔑 *ÚLTIMAS KEYS GENERADAS*\n\n';
            for (const k of list) {
                txt += `Key: ${k.key}\nPlan: ${k.plan}\nDías: ${k.days}\nUsada: ${k.used ? 'Sí' : 'No'}\n`;
                if (k.usedInGroup) txt += `Grupo: ${k.usedInGroup}\n`;
                txt += `Creada: ${new Date(k.createdAt).toISOString().slice(0, 19).replace('T', ' ')}\n\n`;
            }
            return sock.sendMessage(from, { text: txt.trim() });
        }

        // ===============================
        // .rentas (solo owner)
        // ===============================
        if (cmd === 'rentas') {
            if (!isOwnerUser) {
                return sock.sendMessage(from, { text: '❌ Solo el owner puede ver las rentas.' });
            }
            const list = listRents(50);
            if (!list.length) {
                return sock.sendMessage(from, { text: 'ℹ️ No hay rentas registradas.' });
            }
            let txt = '📦 *RENTAS ACTIVAS Y REGISTRADAS*\n\n';
            for (const r of list) {
                txt += `Grupo: ${r.groupJid}\nPlan: ${r.plan}\nActivo: ${new Date(r.expiresAt) > Date.now() ? 'Sí' : 'No'}\nKey: ${r.key}\nExpira: ${r.expiresAt}\n\n`;
            }
            return sock.sendMessage(from, { text: txt.trim() });
        }

        // ===============================
        // .renovar (solo owner)
        // ===============================
        if (cmd === 'renovar') {
            if (!isOwnerUser) {
                return sock.sendMessage(from, { text: '❌ Solo el owner puede renovar grupos.' });
            }
            if (!isGroup) {
                return sock.sendMessage(from, { text: 'ℹ️ Usa este comando dentro de un grupo.' });
            }
            const daysArg = args[0];
            const days = parseInt(daysArg);
            if (isNaN(days) || days <= 0) {
                return sock.sendMessage(from, { text: '❌ Días inválidos. Ejemplo: .renovar 30' });
            }
            const updated = extendGroupRent(from, days);
            if (!updated) {
                return sock.sendMessage(from, { text: '❌ Este grupo no tiene renta registrada.' });
            }
            return sock.sendMessage(from, {
                text:
`✅ Renta renovada para este grupo.

Días añadidos: ${days}
Nueva expiración: ${updated.expiresAt}`
            });
        }

        // ===============================
        // .on / .off
        // ===============================
        if (cmd === 'on' || cmd === 'off') {
            if (!isGroup) {
                return sock.sendMessage(from, { text: 'ℹ️ Solo usable en grupos.' });
            }
            const feature = (args[0] || '').toLowerCase();
            const valid = ['welcome', 'antilink', 'antiflood'];
            if (!valid.includes(feature)) {
                return sock.sendMessage(from, {
                    text: `❌ Feature inválida.\nUsa: welcome, antilink, antiflood`
                });
            }
            const value = cmd === 'on';
            setChatConfig(from, feature, value);
            return sock.sendMessage(from, {
                text: `⚙️ *${feature}* ha sido ${value ? 'ACTIVADO' : 'DESACTIVADO'} en este grupo.`
            });
        }

        // ===============================
        // .ban / .kick
        // ===============================
        if (cmd === 'ban' || cmd === 'kick') {
            if (!isGroup) {
                return sock.sendMessage(from, { text: 'ℹ️ Solo usable en grupos.' });
            }
            const groupMetadata = await sock.groupMetadata(from);
            const myId = sock.user.id;
            const iAmAdmin = isAdminInGroup(groupMetadata.participants, myId);
            if (!iAmAdmin) {
                return sock.sendMessage(from, { text: '❌ Necesito ser admin para expulsar.' });
            }

            const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (!mentioned.length) {
                return sock.sendMessage(from, {
                    text: '❌ Menciona a la persona que quieres expulsar.\nEjemplo: .ban @usuario'
                });
            }

            await sock.groupParticipantsUpdate(from, mentioned, 'remove');
            return sock.sendMessage(from, {
                text: '✅ Usuario(s) expulsado(s).'
            });
        }

        // ===============================
        // .hola
        // ===============================
        if (cmd === 'hola') {
            return sock.sendMessage(from, {
                text: '👋 Hola, soy *Compita*. ¿Qué necesitas?'
            });
        }

        // ===============================
        // .menu
        // ===============================
        if (cmd === 'menu' || cmd === 'help' || cmd === 'ayuda') {
            return sock.sendMessage(from, {
                text:
`📋 *MENÚ COMPITA*

Comandos base:
.hola
.menu
.mi-plan
.activar KEY

Admin de grupo:
.on welcome
.off welcome
.on antilink
.off antilink
.on antiflood
.off antiflood
.ban @usuario

Owner:
.genkey
.keys
.rentas
.renovar 30`
            });
        }

    });
}

startCompita();