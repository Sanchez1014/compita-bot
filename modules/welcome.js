const { getConfig } = require('./config');

const welcomeSystem = {
  onParticipantAdd: async (sock, groupId, participant) => {
    const config = getConfig(groupId);
    if (!config.welcome) return;

    const user = participant.split('@')[0];
    await sock.sendMessage(groupId, {
      text: `[Compita]\nBienvenido @${user}.`
    });
  },

  onParticipantRemove: async (sock, groupId, participant) => {
    const config = getConfig(groupId);
    if (!config.goodbye) return;

    const user = participant.split('@')[0];
    await sock.sendMessage(groupId, {
      text: `[Compita]\nAdiós @${user}.`
    });
  }
};

module.exports = { welcomeSystem };