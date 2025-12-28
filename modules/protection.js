const { getConfig } = require('./config');
const floodMap = {};

const protectionSystem = {
  checkMessage: async (sock, msg, from, text) => {
    if (!from.endsWith('@g.us')) return;

    const config = getConfig(from);
    const lower = (text || '').toLowerCase();

    // ANTILINK
    if (config.antilink) {
      if (
        lower.includes('http://') ||
        lower.includes('https://') ||
        lower.includes('wa.me') ||
        lower.includes('chat.whatsapp.com')
      ) {
        const participant = msg.key.participant;
        if (!participant) return;

        try {
          await sock.sendMessage(from, { text: '[Compita]\nEnlace detectado. Acción bloqueada.' });
          await sock.groupParticipantsUpdate(from, [participant], 'remove');
        } catch {
          await sock.sendMessage(from, { text: '[Compita]\nNo tengo permisos para expulsar.' });
        }
      }
    }

    // ANTIFLOOD
    if (config.antiflood) {
      const user = msg.key.participant || from;
      const now = Date.now();

      if (!floodMap[user]) floodMap[user] = [];
      floodMap[user].push(now);

      floodMap[user] = floodMap[user].filter((t) => now - t < 5000);

      if (floodMap[user].length >= 5) {
        await sock.sendMessage(from, { text: '[Compita]\nNo hagas spam.' });
        floodMap[user] = [];
      }
    }
  }
};

module.exports = { protectionSystem };