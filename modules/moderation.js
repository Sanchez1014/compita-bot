// ======================================================
// MODERATION.JS — SISTEMA PROFESIONAL DE MODERACIÓN
// ======================================================

const floodMap = new Map();

// ------------------------------------------------------
// Verificar si soy admin en el grupo
// ------------------------------------------------------
function isAdminInGroup(participants, myId) {
    const p = participants.find((x) => x.id === myId);
    return p?.admin === "admin" || p?.admin === "superadmin";
}

// ------------------------------------------------------
// Anti‑Flood — Detecta spam de mensajes
// ------------------------------------------------------
function checkFlood(groupJid, sender, maxMessages = 5, intervalMs = 5000) {
    const key = `${groupJid}:${sender}`;
    const now = Date.now();

    if (!floodMap.has(key)) {
        floodMap.set(key, { count: 1, first: now });
        return false;
    }

    const data = floodMap.get(key);

    // Si pasó el intervalo, reiniciar contador
    if (now - data.first > intervalMs) {
        floodMap.set(key, { count: 1, first: now });
        return false;
    }

    data.count++;

    if (data.count >= maxMessages) {
        floodMap.delete(key);
        return true; // Flood detectado
    }

    return false;
}

// ------------------------------------------------------
// Base para Anti‑Link (opcional)
// ------------------------------------------------------
function containsLink(text) {
    const regex = /(https?:\/\/|chat\.whatsapp\.com)/i;
    return regex.test(text);
}

// ------------------------------------------------------
// Base para mensajes de bienvenida
// ------------------------------------------------------
function welcomeMessage(user) {
    return `Bienvenido ${user} al grupo.`;
}

module.exports = {
    isAdminInGroup,
    checkFlood,
    containsLink,
    welcomeMessage
};