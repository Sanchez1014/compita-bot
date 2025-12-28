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

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Sesión cerrada. Borra auth.json");
            } else {
                console.log("♻️ Reconectando...");
                start();
            }
        }

        if (connection === "open") {
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