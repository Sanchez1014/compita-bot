// ===============================
// SISTEMA DE OWNERS — COMPITA BOT
// ===============================

const OWNERS = [
    "195928086569094@lid",        // ← TU JID REAL
   ];

function isOwner(jid) {
    return OWNERS.includes(jid);
}

module.exports = {
    OWNERS,
    isOwner
};