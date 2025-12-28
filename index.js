const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./modules/router');
const { welcomeSystem } = require('./modules/welcome');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();
      console.log('Escanea este QR con WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('Conexión cerrada');
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Compita — ONLINE');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    await handleMessage(sock, msg);
  });

  sock.ev.on('group-participants.update', async (update) => {
    const groupId = update.id;

    for (const participant of update.participants) {
      if (update.action === 'add') {
        await welcomeSystem.onParticipantAdd(sock, groupId, participant);
      } else if (update.action === 'remove') {
        await welcomeSystem.onParticipantRemove(sock, groupId, participant);
      }
    }
  });
}

startBot();