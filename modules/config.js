// ===============================
// SISTEMA DE OWNERS — COMPITA BOT
// ===============================

// LISTA DE OWNERS (puedes agregar todos los que quieras)
const OWNERS = [
    "18186743565@s.whatsapp.net",   // Tu número principal (correcto)
    "18183913545@s.whatsapp.net"    // Número del bot
];

// FUNCIÓN PARA VERIFICAR SI ALGUIEN ES OWNER
function isOwner(jid) {
    return OWNERS.includes(jid);
}

module.exports = {
    OWNERS,
    isOwner
};