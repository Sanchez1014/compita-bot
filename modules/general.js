const { setConfig } = require('./config');

const generalCommands = {
  '.hola': async (sock, msg, from) => {
    await sock.sendMessage(from, {
      text: '[Compita]\nEstoy activo.'
    });
  },

  '.menu': async (sock, msg, from) => {
    await sock.sendMessage(from, {
      text:
`[Compita — Panel]

Sistemas:
  .on welcome / .off welcome
  .on antilink / .off antilink
  .on antiflood / .off antiflood

Moderación:
  .kick @usuario
  .add número
  .promote @usuario
  .demote @usuario

Generales:
  .hola
  .menu`
    });
  },

  '.on': async (sock, msg, from, text) => {
    const key = text.split(' ')[1];
    if (!key) return sock.sendMessage(from, { text: '[Compita]\nEspecifica un sistema.' });

    setConfig(from, key, true);
    await sock.sendMessage(from, { text: `[Compita]\nSistema '${key}' activado.` });
  },

  '.off': async (sock, msg, from, text) => {
    const key = text.split(' ')[1];
    if (!key) return sock.sendMessage(from, { text: '[Compita]\nEspecifica un sistema.' });

    setConfig(from, key, false);
    await sock.sendMessage(from, { text: `[Compita]\nSistema '${key}' desactivado.` });
  }
};

module.exports = { generalCommands };