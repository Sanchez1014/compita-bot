// ===============================
// SISTEMA DE OWNERS — COMPITA BOT
// ===============================

const OWNERS = [
    "18186743565@s.whatsapp.net",   // Tu número principal
    "18183913545@s.whatsapp.net"    // Número del bot
];

function isOwner(jid) {
    return OWNERS.includes(jid);
}

module.exports = {
    OWNERS,
    isOwner
};