const groupConfig = {};

function getConfig(groupId) {
  if (!groupConfig[groupId]) {
    groupConfig[groupId] = {
      welcome: false,
      goodbye: false,
      antilink: false,
      antiflood: false,
      mod: true
    };
  }
  return groupConfig[groupId];
}

function setConfig(groupId, key, value) {
  const config = getConfig(groupId);
  config[key] = value;
}

module.exports = { getConfig, setConfig };