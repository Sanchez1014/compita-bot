// ======================================================
// COMPITA — SISTEMA PROFESIONAL DESDE CERO
// ======================================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

// Módulos internos
const { generateKey, listKeys, checkOwnerPermission } = require("./modules/keys");
const { activarKeyEnGrupo, isGroupActive, getGroupRent, extendGroupRent, listRents } = require("./modules/activateKey");
const { isAdminInGroup, checkFlood } = require("./modules/moderation");
const { getChatConfig, setChatConfig } = require("./modules/config");

// Config general
const OWNER = ["195928086569094@lid"];
const PREFIX = ".";

async function startCompita() {
    console.log("🚀 Iniciando COMPITA desde cero...");

    const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    syncFullHistory: false
});

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (update.qr) {
            console.log("📌 Escanea este QR:");
            console.log(update.qr);
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Sesión cerrada. Borra la carpeta auth.");
            } else {
                console.log("♻️ Reconectando...");
                startCompita();
            }
        }

        if (connection === "open") {
            console.log("✅ COMPITA ONLINE");
        }
    });

    // ======================================================
    // MENSAJES
    // ======================================================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");
            const sender = msg.key.participant || msg.key.remoteJid;
            const myId = sock.user.id;

            const body =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                "";

            if (!body) return;

            console.log(`📩 ${from} | ${sender} | ${body}`);

            // Moderación
            if (isGroup) {
                const cfg = getChatConfig(from);

                if (cfg.antiflood) {
                    const flood = checkFlood(from, sender, 5, 5000);

                    if (flood) {
                        const meta = await sock.groupMetadata(from);
                        const admin = isAdminInGroup(meta.participants, myId);

                        if (admin) {
                            await sock.sendMessage(from, { text: "🚫 Flood detectado." });
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                        }
                    }
                }
            }

            if (!body.startsWith(PREFIX)) return;

            const args = body.trim().split(/\s+/);
            const cmd = args.shift().slice(1).toLowerCase();
            const isOwnerUser = OWNER.includes(sender);

            const freeCommands = ["activar", "hola", "menu", "help", "ayuda", "mi-plan"];

            if (isGroup && !freeCommands.includes(cmd)) {
                if (!isGroupActive(from)) {
                    return sock.sendMessage(from, {
                        text: "⚠️ Grupo sin renta activa.\nUsa: .activar KEY"
                    });
                }
            }

            // ============================
            // COMANDOS
            // ============================

            if (cmd === "hola") {
                return sock.sendMessage(from, { text: "Hola, soy Compita desde cero." });
            }

            if (["menu", "help", "ayuda"].includes(cmd)) {
                return sock.sendMessage(from, {
                    text:
`📘 MENÚ COMPITA

• .hola
• .menu
• .activar KEY
• .mi-plan

Owner:
• .genkey PASS días plan
• .keys
• .rentas
• .renovar días`
                });
            }

            if (cmd === "genkey") {
                const pass = args[0];
                const days = parseInt(args[1]);
                const plan = (args[2] || "BASIC").toUpperCase();

                if (!checkOwnerPermission(sender, pass)) {
                    return sock.sendMessage(from, { text: "❌ Password incorrecto." });
                }

                const { key } = generateKey(plan, days);

                return sock.sendMessage(from, {
                    text:
`🔑 KEY GENERADA

Key: ${key}
Plan: ${plan}
Días: ${days}

Usa:
.activar ${key}`
                });
            }

            if (cmd === "activar") {
                const key = args[0];
                if (!key) return sock.sendMessage(from, { text: "❌ Falta la key." });

                return activarKeyEnGrupo(sock, from, sender, key);
            }

            if (cmd === "mi-plan") {
                const r = getGroupRent(from);
                if (!r) return sock.sendMessage(from, { text: "❌ Sin renta activa." });

                return sock.sendMessage(from, {
                    text:
`📦 PLAN

Plan: ${r.plan}
Expira: ${r.expiresAt}`
                });
            }

            if (cmd === "keys" && isOwnerUser) {
                const list = listKeys(20);
                return sock.sendMessage(from, { text: JSON.stringify(list, null, 2) });
            }

            if (cmd === "rentas" && isOwnerUser) {
                const list = listRents(50);
                return sock.sendMessage(from, { text: JSON.stringify(list, null, 2) });
            }

            if (cmd === "renovar" && isOwnerUser) {
                const days = parseInt(args[0]);
                const updated = extendGroupRent(from, days);

                return sock.sendMessage(from, {
                    text: `Renovado. Nueva expiración: ${updated.expiresAt}`
                });
            }

        } catch (err) {
            console.log("❌ Error:", err);
        }
    });
}

startCompita();