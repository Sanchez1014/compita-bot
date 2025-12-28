import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { loadCommands } from './utils/loader.js';

async function startBot() {
  const sock = makeWASocket();

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot conectado');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text;

    // Cargar comandos
    const commands = await loadCommands();
    for (const cmd of commands) {
      if (body.startsWith(cmd.name)) {
        await cmd.execute(sock, msg, from);
      }
    }
  });
}

startBot();