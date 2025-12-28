export async function isAdmin(sock, groupId, sender) {
  const metadata = await sock.groupMetadata(groupId);
  const admins = metadata.participants.filter(p => p.admin);
  return admins.some(a => a.id === sender);
}