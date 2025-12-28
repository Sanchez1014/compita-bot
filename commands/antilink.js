import { isAdmin } from '../utils/permissions.js';

export default {
  name: '.antilink',
  async execute(sock, msg, from) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const parts = msg.message.conversation.split(' ');
    const action = parts[1]; // on / off

    if (!(await isAdmin(sock, from, sender))) {
      await sock.sendMessage(from, { text: '❌ Solo los admins pueden usar este comando.' });
      return;
    }

    if (action === 'on') {
      await sock.sendMessage(from, { text: '🚫 Protección contra links ACTIVADA.' });
      sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        const text = m.message?.conversation || '';
        if (text.includes('http')) {
          await sock.sendMessage(from, { text: '⚠️ Link detectado y eliminado.' });
          await sock.sendMessage(from, { delete: m.key });
        }
      });
    } else if (action === 'off') {
      await sock.sendMessage(from, { text: '✅ Protección contra links DESACTIVADA.' });
    } else {
      await sock.sendMessage(from, { text: 'Uso: .antilink on/off' });
    }
  }
};