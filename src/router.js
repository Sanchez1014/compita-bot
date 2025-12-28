import { PREFIX } from './config.js';
import * as cmds from './commands/index.js';

export async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    '';

  if (!text.startsWith(PREFIX)) return;

  const args = text.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  const aliasMap = { h: 'help', menu: 'menu', n: 'announce' };
  const realCmd = cmds[cmd] ? cmd : aliasMap[cmd] ? aliasMap[cmd] : null;

  if (!realCmd) {
    return sock.sendMessage(from, {
      text: 'Comando no reconocido, compita. Usa `.help` para ver la lista.'
    });
  }

  try {
    await cmds[realCmd](sock, msg, from, args);
  } catch (e) {
    console.error('Error ejecutando comando', realCmd, e);
    await sock.sendMessage(from, { text: 'Ocurrió un error interno, compita.' });
  }
}