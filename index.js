<<<<<<< HEAD
const {
    default: makeWASocket,
    useSingleFileAuthState,
    DisconnectReason
} = require("@adiwajshing/baileys");

const qrcode = require("qrcode-terminal");
const fs = require("fs");

async function start() {
    const { state, saveState } = useSingleFileAuthState("./auth.json");

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

=======
// ======================================================
// COMPITA — SISTEMA PROFESIONAL (VERSIÓN OPTIMIZADA)
// Compatible con Baileys MD moderno
// Con sistema de keys, activación, moderación y logs
// ======================================================

// ------------------------------
// IMPORTS PRINCIPALES
// ------------------------------
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

// ------------------------------
// IMPORTS DE MÓDULOS INTERNOS
// ------------------------------
const {
    generateKey,
    listKeys,
    checkOwnerPermission
} = require("./modules/keys");

const {
    activarKeyEnGrupo,
    isGroupActive,
    getGroupRent,
    extendGroupRent,
    listRents
} = require("./modules/activateKey");

const {
    isAdminInGroup,
    checkFlood
} = require("./modules/moderation");

const {
    getChatConfig,
    setChatConfig
} = require("./modules/config");

// ------------------------------
// CONFIGURACIÓN GENERAL
// ------------------------------
const OWNER = ["195928086569094@lid"]; // <-- Tu JID real (LID)
const PREFIX = ".";

// ------------------------------
// FUNCIÓN PRINCIPAL
// ------------------------------
async function startCompita() {
    console.log("🚀 Iniciando COMPITA...");

    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        printQRInTerminal: false, // QR ahora se maneja manualmente
        auth: state,
        syncFullHistory: false
    });

    // Guardar credenciales
    sock.ev.on("creds.update", saveCreds);

    // ------------------------------
    // EVENTO DE CONEXIÓN (QR + ESTADO)
    // ------------------------------
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        // Mostrar QR manualmente
        if (update.qr) {
            console.log("📌 Escanea este QR para iniciar sesión:");
            console.log(update.qr);
        }

        // Reconexión automática
>>>>>>> 8eef06ea2fbd44766a5adc104c09a74f98374007
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason === DisconnectReason.loggedOut) {
<<<<<<< HEAD
                console.log("❌ Sesión cerrada. Borra auth.json");
            } else {
                console.log("♻️ Reconectando...");
                start();
=======
                console.log("❌ Sesión cerrada. Borra la carpeta auth y vuelve a escanear.");
            } else {
                console.log("♻️ Reconectando COMPITA...");
                startCompita();
>>>>>>> 8eef06ea2fbd44766a5adc104c09a74f98374007
            }
        }

        if (connection === "open") {
<<<<<<< HEAD
            console.log("✅ Bot conectado correctamente");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        console.log("📩 Mensaje recibido:", text);

        if (text === "hola") {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "Hola, soy tu bot Compita!"
            });
        }
    });
}

start();
=======
            console.log("✅ COMPITA — ONLINE");
        }
    });    // ======================================================
    // PROCESAMIENTO DE MENSAJES
    // ======================================================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");

            // Detectar remitente real (LID compatible)
            const sender =
                msg.key.participant ||
                msg.key.remoteJid ||
                "desconocido@lid";

            const myId = sock.user.id;

            // Extraer texto del mensaje
            const body =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                "";

            // Logs profesionales
            console.log(
                `📩 Mensaje recibido — ${isGroup ? "Grupo" : "Privado"} | ${from} | ${sender} | ${body}`
            );

            // Ignorar mensajes vacíos
            if (!body) return;

            // ======================================================
            // SISTEMA DE MODERACIÓN (solo grupos)
            // ======================================================
            if (isGroup) {
                const cfg = getChatConfig(from);

                // ANTI-FLOOD
                if (cfg.antiflood) {
                    const isFlood = checkFlood(
                        from,
                        sender,
                        cfg.maxFloodMessages || 5,
                        cfg.floodIntervalMs || 5000
                    );

                    if (isFlood) {
                        const groupMetadata = await sock.groupMetadata(from);
                        const iAmAdmin = isAdminInGroup(
                            groupMetadata.participants,
                            myId
                        );

                        if (iAmAdmin) {
                            await sock.sendMessage(from, {
                                text: "🚫 Flood detectado, usuario expulsado."
                            });

                            await sock.groupParticipantsUpdate(
                                from,
                                [sender],
                                "remove"
                            );
                        }
                    }
                }
            }

            // ======================================================
            // SISTEMA DE COMANDOS
            // ======================================================
            if (!body.startsWith(PREFIX)) return;

            const args = body.trim().split(/\s+/);
            const cmd = args.shift().slice(1).toLowerCase();

            // Detectar si el usuario es owner
            const isOwnerUser = OWNER.includes(sender);
            // ======================================================
            // COMANDOS BASE (NO REQUIEREN RENTA)
            // ======================================================
            const freeCommands = [
                "activar",
                "hola",
                "menu",
                "help",
                "ayuda",
                "mi-plan"
            ];

            // ======================================================
            // BLOQUEO POR RENTA (SOLO GRUPOS)
            // ======================================================
            if (isGroup && !freeCommands.includes(cmd)) {
                const activo = isGroupActive(from);

                if (!activo) {
                    return sock.sendMessage(from, {
                        text:
`⚠️ *Este grupo no tiene una renta activa.*

Pide una KEY a tu proveedor y usa:
.activar TU-KEY`
                    });
                }
            }

            // ======================================================
            // .JID — Mostrar JID real
            // ======================================================
            if (cmd === "jid") {
                return sock.sendMessage(from, {
                    text: `Tu JID real es:\n${sender}`
                });
            }

            // ======================================================
            // .GENKEY — Generar keys (solo owner)
            // ======================================================
            if (cmd === "genkey") {
                const password = args[0];
                const daysArg = args[1];
                const plan = (args[2] || "BASIC").toUpperCase();

                if (!checkOwnerPermission(sender, password)) {
                    return sock.sendMessage(from, {
                        text: "❌ No tienes permisos o el password es incorrecto."
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
`🔑 *KEY GENERADA — COMPITA*

Key: ${key}
Plan: ${plan}
Días: ${days}
Creada: ${new Date(data.createdAt)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")}

📌 Entrega esta key al cliente y dile:
1) Agrega a Compita a su grupo
2) Use: .activar ${key}`
                });
            }

            // ======================================================
            // .ACTIVAR — Activar key en grupo
            // ======================================================
            if (cmd === "activar") {
                const key = args[0];

                if (!key) {
                    return sock.sendMessage(from, {
                        text: "❌ Debes ingresar una key.\nEjemplo: .activar COMPITA-XXXX"
                    });
                }

                try {
                    return activarKeyEnGrupo(sock, from, sender, key);
                } catch (e) {
                    return sock.sendMessage(from, {
                        text: "❌ Error interno al activar la key.\n" + e.message
                    });
                }
            }

            // ======================================================
            // .MI-PLAN — Ver plan del grupo
            // ======================================================
            if (cmd === "mi-plan") {
                if (!isGroup) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ Usa este comando dentro del grupo donde está Compita."
                    });
                }

                const r = getGroupRent(from);

                if (!r) {
                    return sock.sendMessage(from, {
                        text: "❌ Este grupo no tiene una renta activa."
                    });
                }

                return sock.sendMessage(from, {
                    text:
`📦 *PLAN DE ESTE GRUPO*

Plan: ${r.plan}
Activo: ${isGroupActive(from) ? "Sí" : "No"}
Key: ${r.key}
Expira: ${r.expiresAt ? r.expiresAt : "Sin fecha"}`
                });
            }
            // ======================================================
            // .KEYS — Ver últimas keys (solo owner)
            // ======================================================
            if (cmd === "keys") {
                if (!isOwnerUser) {
                    return sock.sendMessage(from, {
                        text: "❌ Solo el owner puede ver las keys."
                    });
                }

                const list = listKeys(20);

                if (!list.length) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ No hay keys registradas."
                    });
                }

                let txt = "🔑 *ÚLTIMAS KEYS GENERADAS*\n\n";

                for (const k of list) {
                    txt += `Key: ${k.key}\nPlan: ${k.plan}\nDías: ${k.days}\nUsada: ${k.used ? "Sí" : "No"}\n`;
                    if (k.usedInGroup) txt += `Grupo: ${k.usedInGroup}\n`;
                    txt += `Creada: ${new Date(k.createdAt).toISOString().slice(0, 19).replace("T", " ")}\n\n`;
                }

                return sock.sendMessage(from, { text: txt.trim() });
            }

            // ======================================================
            // .RENTAS — Ver rentas registradas (solo owner)
            // ======================================================
            if (cmd === "rentas") {
                if (!isOwnerUser) {
                    return sock.sendMessage(from, {
                        text: "❌ Solo el owner puede ver las rentas."
                    });
                }

                const list = listRents(50);

                if (!list.length) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ No hay rentas registradas."
                    });
                }

                let txt = "📦 *RENTAS ACTIVAS Y REGISTRADAS*\n\n";

                for (const r of list) {
                    txt += `Grupo: ${r.groupJid}\nPlan: ${r.plan}\nActivo: ${new Date(r.expiresAt) > Date.now() ? "Sí" : "No"}\nKey: ${r.key}\nExpira: ${r.expiresAt}\n\n`;
                }

                return sock.sendMessage(from, { text: txt.trim() });
            }

            // ======================================================
            // .RENOVAR — Añadir días a un grupo (solo owner)
            // ======================================================
            if (cmd === "renovar") {
                if (!isOwnerUser) {
                    return sock.sendMessage(from, {
                        text: "❌ Solo el owner puede renovar grupos."
                    });
                }

                if (!isGroup) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ Usa este comando dentro de un grupo."
                    });
                }

                const daysArg = args[0];
                const days = parseInt(daysArg);

                if (isNaN(days) || days <= 0) {
                    return sock.sendMessage(from, {
                        text: "❌ Días inválidos. Ejemplo: .renovar 30"
                    });
                }

                const updated = extendGroupRent(from, days);

                if (!updated) {
                    return sock.sendMessage(from, {
                        text: "❌ Este grupo no tiene renta registrada."
                    });
                }

                return sock.sendMessage(from, {
                    text:
`✅ Renta renovada para este grupo.

Días añadidos: ${days}
Nueva expiración: ${updated.expiresAt}`
                });
            }

            // ======================================================
            // .ON / .OFF — Activar o desactivar funciones del grupo
            // ======================================================
            if (cmd === "on" || cmd === "off") {
                if (!isGroup) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ Solo usable en grupos."
                    });
                }

                const feature = (args[0] || "").toLowerCase();
                const valid = ["welcome", "antilink", "antiflood"];

                if (!valid.includes(feature)) {
                    return sock.sendMessage(from, {
                        text: `❌ Feature inválida.\nUsa: welcome, antilink, antiflood`
                    });
                }

                const value = cmd === "on";
                setChatConfig(from, feature, value);

                return sock.sendMessage(from, {
                    text: `⚙️ *${feature}* ha sido ${value ? "ACTIVADO" : "DESACTIVADO"} en este grupo.`
                });
            }

            // ======================================================
            // .BAN / .KICK — Expulsar usuarios
            // ======================================================
            if (cmd === "ban" || cmd === "kick") {
                if (!isGroup) {
                    return sock.sendMessage(from, {
                        text: "ℹ️ Solo usable en grupos."
                    });
                }

                const groupMetadata = await sock.groupMetadata(from);
                const iAmAdmin = isAdminInGroup(groupMetadata.participants, myId);

                if (!iAmAdmin) {
                    return sock.sendMessage(from, {
                        text: "❌ Necesito ser admin para expulsar."
                    });
                }

                const mentioned =
                    msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

                if (!mentioned.length) {
                    return sock.sendMessage(from, {
                        text: "❌ Menciona a la persona que quieres expulsar.\nEjemplo: .ban @usuario"
                    });
                }

                await sock.groupParticipantsUpdate(from, mentioned, "remove");

                return sock.sendMessage(from, {
                    text: "✅ Usuario(s) expulsado(s)."
                });
            }
            // ======================================================
            // .HOLA — Comando simple para pruebas
            // ======================================================
            if (cmd === "hola") {
                return sock.sendMessage(from, {
                    text: "Hola, soy Compita. ¿En qué puedo ayudarte?"
                });
            }

            // ======================================================
            // .MENU — Menú profesional sin emojis infantiles
            // ======================================================
            if (cmd === "menu" || cmd === "help" || cmd === "ayuda") {
                let txt =
`📘 *MENÚ PRINCIPAL — COMPITA*

Comandos disponibles:

• .hola
• .menu
• .mi-plan
• .activar KEY

Si este grupo tiene renta activa:
• .on welcome
• .on antilink
• .on antiflood
• .off welcome
• .off antilink
• .off antiflood
• .ban @usuario
• .kick @usuario

Comandos del owner:
• .genkey PASS días plan
• .keys
• .rentas
• .renovar días

Sistema profesional de keys y rentas listo para distribución.`;

                return sock.sendMessage(from, { text: txt });
            }

            // ======================================================
            // FIN DEL SISTEMA DE COMANDOS
            // ======================================================

        } catch (err) {
            console.log("❌ Error procesando mensaje:", err);
        }
    });
    // ======================================================
    // FIN DE startCompita()
    // ======================================================
}

// ======================================================
// INICIO AUTOMÁTICO DE COMPITA
// ======================================================
startCompita();

// ======================================================
// MANEJO GLOBAL DE ERRORES (ANTI-CRASH)
// ======================================================
process.on("uncaughtException", (err) => {
    console.log("❌ Error no capturado:", err);
});

process.on("unhandledRejection", (reason) => {
    console.log("❌ Promesa rechazada sin manejar:", reason);
});
>>>>>>> 8eef06ea2fbd44766a5adc104c09a74f98374007
