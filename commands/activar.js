import fs from 'fs';

export default {
  name: '.activar',
  async execute(sock, msg, from) {
    const key = msg.message.conversation.split(' ')[1];
    let db = JSON.parse(fs.readFileSync('./database.json'));

    if (key === 'ABC123') {
      db.activatedGroups.push({ id: from, key, expires: '2026-01-15' });
      fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
      await sock.sendMessage(from, { text: '✅ Grupo activado correctamente.' });
    } else {
      await sock.sendMessage(from, { text: '❌ Key inválida.' });
    }
  }
};