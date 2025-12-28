export default {
  name: '.hola',
  async execute(sock, msg, from) {
    await sock.sendMessage(from, { text: '👋 Hola, soy Compita Bot!' });
  }
};