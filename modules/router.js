const { isOwner } = require('./config');
const { generateKey } = require('./modules/keys');

case '.genkey': {
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

    sock.ev.once('messages.upsert', async (m) => {
        try {
            const reply = m.messages[0];
            const text = reply.message.conversation || reply.message.extendedTextMessage?.text;

            const days = parseInt(text);
            if (!days || days < 1) {
                return sock.sendMessage(from, { text: "❌ Número inválido. Intenta de nuevo." });
            }

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