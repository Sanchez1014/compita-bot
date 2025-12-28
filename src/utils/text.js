import { BOT_NAME, PREFIX } from '../config.js';

export function formatHelp() {
  return (
    `🤖 *${BOT_NAME} – Panel de ayuda*\n\n` +
    `*Comandos básicos:*\n` +
    `• ${PREFIX}ping\n` +
    `• ${PREFIX}help / ${PREFIX}menu\n\n` +
    `*Moderación:*\n` +
    `• ${PREFIX}kick @usuario\n` +
    `• ${PREFIX}add 521XXXXXXXXXX\n` +
    `• ${PREFIX}promote @usuario\n` +
    `• ${PREFIX}demote @usuario\n` +
    `• ${PREFIX}mute / ${PREFIX}unmute\n` +
    `• ${PREFIX}n mensaje\n` +
    `• ${PREFIX}welcome on/off\n` +
    `• ${PREFIX}antilink on/off\n` +
    `• ${PREFIX}antiflood on/off\n\n` +
    `*Diversión:*\n` +
    `• ${PREFIX}sticker\n` +
    `• ${PREFIX}meme\n` +
    `• ${PREFIX}dice\n` +
    `• ${PREFIX}coin\n` +
    `• ${PREFIX}hack @usuario\n` +
    `• ${PREFIX}ship @1 @2\n` +
    `• ${PREFIX}insult @usuario\n` +
    `• ${PREFIX}love @usuario\n`
  );
}

export function formatMenu() {
  return (
    `📋 *MENÚ – ${BOT_NAME}*\n\n` +
    `Usa ${PREFIX}help para ver detalles de cada comando.\n`
  );
}