export default {
  name: '.menu',
  async execute(sock, msg, from) {
    const menu = `
📖 *Menú de Compita Bot*
.hola → saludo
.menu → ver comandos
.activar KEY → activar grupo
.antilink → activar protección de links
    `;
    await sock.sendMessage(from, { text: menu });
  }
};