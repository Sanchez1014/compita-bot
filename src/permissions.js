import { OWNERS } from './config.js';

export function isOwner(senderJid) {
  if (!OWNERS.length) return false;
  const numero = senderJid.split('@')[0];
  return OWNERS.includes(numero);
}

export async function isGroupAdmin(sock, groupJid, userJid) {
  const metadata = await sock.groupMetadata(groupJid);
  const adminIds = metadata.participants
    .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
    .map((p) => p.id);

  return adminIds.includes(userJid);
}

export async function canUseAdminCommand(sock, msg, from) {
  const senderJid = msg.key.participant || msg.key.remoteJid;

  if (isOwner(senderJid)) return true;
  if (!from.endsWith('@g.us')) return false;

  const admin = await isGroupAdmin(sock, from, senderJid);
  return admin;
}