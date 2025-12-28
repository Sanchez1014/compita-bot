const { getConfig } = require('./config');
const { generalCommands } = require('./general');
const { moderationCommands } = require('./moderation');
const { protectionSystem } = require('./protection');

function parseMessage(msg) {
  const from = msg.key.remoteJid;
  const type = Object.keys(msg.message)[0];

  let text = '';
  if (type === 'conversation') text = msg.message.conversation;
  if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;

  return { from, text: text || '' };
}

async function handleMessage(sock, msg) {
  const { from, text } = parseMessage(msg);
  const config = getConfig(from);

  await protectionSystem.checkMessage(sock, msg, from, text);

  const command = text.split(' ')[0].toLowerCase();

  if (generalCommands[command]) {
    return generalCommands[command](sock, msg, from, text);
  }

  if (config.mod && moderationCommands[command]) {
    return moderationCommands[command](sock, msg, from, text);
  }
}

module.exports = { handleMessage };