const moderationCommands = {
  '.kick': async (sock, msg, from) => {
    const mention = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mention) return sock.sendMessage(from, { text: '[Compita]\nDebes mencionar a alguien.' });

    try {
      await sock.groupParticipantsUpdate(from, mention, 'remove');
      await sock.sendMessage(from, { text: '[Compita]\nUsuario expulsado.' });
    } catch {
      await sock.sendMessage(from, { text: '[Compita]\nNo tengo permisos de admin.' });
    }
  },

  '.add': async (sock, msg, from, text) => {
    const number = text.replace('.add', '').trim();
    if (!number) return sock.sendMessage(from, { text: '[Compita]\nDebes escribir un número.' });

    try {
      await sock.groupParticipantsUpdate(from, [`${number}@s.whatsapp.net`], 'add');
      await sock.sendMessage(from, { text: '[Compita]\nUsuario agregado.' });
    } catch {
      await sock.sendMessage(from, { text: '[Compita]\nNo pude agregarlo.' });
    }
  },

  '.promote': async (sock, msg, from) => {
    const mention = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mention) return sock.sendMessage(from, { text: '[Compita]\nDebes mencionar a alguien.' });

    try {
      await sock.groupParticipantsUpdate(from, mention, 'promote');
      await sock.sendMessage(from, { text: '[Compita]\nUsuario ascendido.' });
    } catch {
      await sock.sendMessage(from, { text: '[Compita]\nNo pude ascenderlo.' });
    }
  },

  '.demote': async (sock, msg, from) => {
    const mention = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mention) return sock.sendMessage(from, { text: '[Compita]\nDebes mencionar a alguien.' });

    try {
      await sock.groupParticipantsUpdate(from, mention, 'demote');
      await sock.sendMessage(from, { text: '[Compita]\nUsuario degradado.' });
    } catch {
      await sock.sendMessage(from, { text: '[Compita]\nNo pude degradarlo.' });
    }
  }
};

module.exports = { moderationCommands };