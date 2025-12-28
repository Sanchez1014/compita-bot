// ===============================
// ROUTER PRINCIPAL — COMPITA BOT
// ===============================

const { isOwner } = require('./config');
const { generateKey } = require('./modules/keys');
const { activarKey } = require('./modules/activateKey');
const { getUserPlan } = require('./modules/rent');

module.exports = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];

        // Obtener texto del mensaje
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

        if (!body) return;

        // Prefijo
        const prefix = ".";
        if (!body.startsWith(prefix)) return;

        // Separar comando y argumentos
        const args = body.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // ===============================
        // SWITCH DE COMANDOS
        // ===============================
        switch (command) {

            // ===============================
            // COMANDO: .ping
            // ===============================
            case 'ping':
                await sock.sendMessage(from, { text: "🏓 Pong!" });
                break;

            // ===============================
            // COMANDO: .mi-plan
            // ===============================
            case 'mi-plan': {
                const sender = msg.key.participant || msg.key.remoteJid;
                const plan = getUserPlan(sender);

                if (!plan) {
                    return sock.sendMessage(from, { text: "❌ No tienes un plan activo." });
                }

                return sock.sendMessage(from, {
                    text: `📅 *Tu plan*\n\nTipo: ${plan.type}\nExpira: ${plan.expiration}`
                });
            }
            break;

            // ===============================
            // COMANDO: .activar KEY
            // ===============================
            case 'activar': {
                const key = args[0];
                if (!key) {
                    return sock.sendMessage(from, { text: "❌ Debes poner una key.\nEjemplo: .activar ABCD-1234" });
                }

                const sender = msg.key.participant || msg.key.remoteJid;
                const result = activarKey(sender, key);

                return sock.sendMessage(from, { text: result });
            }
            break;

            // ===============================
            // COMANDO: .genkey (INTERACTIVO)
            // ===============================
            case 'genkey': {
                const sender = msg.key.participant || msg.key.remoteJid;

                // 1. Verificar que el mensaje viene de un OWNER
                if (!isOwner(sender)) {
                    return sock.sendMessage(from, { text: "❌ No tienes permiso para generar keys." });
                }

                // 2. Verificar password
                const password = args[0];
                if (password !== "CARNITASM") {
                    return sock.sendMessage(from, { text: "❌ Password incorrecto." });
                }

                // 3. Preguntar por los días
                await sock.sendMessage(from, { text: "⏳ ¿Cuántos días quieres darle a la key?" });

                // 4. Esperar respuesta
                sock.ev.once('messages.upsert', async (m) => {
                    try {
                        const reply = m.messages[0];
                        const text = reply.message.conversation || reply.message.extendedTextMessage?.text;

                        const days = parseInt(text);
                        if (!days || days < 1) {
                            return sock.sendMessage(from, { text: "❌ Número inválido. Intenta de nuevo." });
                        }

                        // 5. Generar key
                        const { key } = generateKey("PREMIUM", days);

                        return sock.sendMessage(from, {
                            text: `🔑 *KEY GENERADA*\n\nKey: ${key}\nDías: ${days}`
                        });

                    } catch (e) {
                        console.log(e);
                        sock.sendMessage(from, { text: "❌ Ocurrió un error al generar la key." });
                    }
                });

            }
            break;

            // ===============================
            // COMANDO DESCONOCIDO
            // ===============================
            default:
                await sock.sendMessage(from, { text: "❌ Comando no reconocido." });
                break;
        }

    } catch (e) {
        console.log("Error en router:", e);
    }
};