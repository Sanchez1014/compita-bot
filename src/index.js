import { createClient } from './client.js';
import { handleMessage } from './router.js';
import { readJSON, writeJSON } from './utils/tools.js';

const GROUP_DB_PATH = './src/database/groups.json';
export const groupConfig = readJSON(GROUP_DB_PATH, {});

export function saveGroupConfig() {
  writeJSON(GROUP_DB_PATH, groupConfig);
}

async function startBot() {
  const sock = await createClient();

  // Manejo de mensajes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg?.message) return;
    if (msg.key.fromMe) return;

    try {
      await handleMessage(sock, msg);
    } catch (err) {
      console.error('Error en handleMessage:', err);
    }
  });

  // Mensajes de bienvenida
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    if (!groupConfig[id]?.welcome) return;

    if (action === 'add') {
      for (const user of participants) {
        await sock.sendMessage(id, {
          text: `👋 Bienvenido @${user.split('@')[0]} al grupo!`,
          mentions: [user]
        });
      }
    }
  });

  // Anti-link básico
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return;

    if (groupConfig[from]?.antilink) {
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (text.includes('http://') || text.includes('https://')) {
        try {
          await sock.sendMessage(from, {
            text: `🚫 Link detectado, mensaje eliminado.`
          });
          await sock.sendMessage(from, { delete: msg.key });
        } catch (e) {
          console.error('Error eliminando link:', e);
        }
      }
    }
  });

  console.log('🤖 Compita está listo y escuchando mensajes...');
}

startBot().catch((err) => console.error('Error al iniciar Compita:', err));