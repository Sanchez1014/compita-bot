import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

export async function createClient() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Conexión cerrada, motivo:', reason);

      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Sesión cerrada definitivamente. Borra la carpeta auth para iniciar limpio.');
      } else {
        console.log(♻️ Reintentando conexión...');
        createClient();
      }
    } else if (connection === 'open') {
      console.log('✅ Compita conectado a WhatsApp.');
    }
  });

  return sock;
}