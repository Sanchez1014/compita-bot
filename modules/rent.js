// ======================================================
// RENT.JS — UTILIDADES PROFESIONALES PARA RENTAS
// ======================================================

const fs = require("fs");
const path = require("path");

const RENTS_FILE = path.join(__dirname, "../database/rents.json");

// Asegurar archivo
if (!fs.existsSync(RENTS_FILE)) {
    fs.writeFileSync(RENTS_FILE, JSON.stringify([]));
}

// ------------------------------------------------------
// Cargar rentas
// ------------------------------------------------------
function loadRents() {
    return JSON.parse(fs.readFileSync(RENTS_FILE));
}

// ------------------------------------------------------
// Guardar rentas
// ------------------------------------------------------
function saveRents(data) {
    fs.writeFileSync(RENTS_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// Obtener renta por grupo
// ------------------------------------------------------
function getRent(groupJid) {
    const rents = loadRents();
    return rents.find((x) => x.groupJid === groupJid) || null;
}

// ------------------------------------------------------
// Verificar si está activo
// ------------------------------------------------------
function isActive(groupJid) {
    const r = getRent(groupJid);
    if (!r) return false;
    return Date.now() < r.expiresAt;
}

// ------------------------------------------------------
// Formatear fecha
// ------------------------------------------------------
function formatDate(timestamp) {
    if (!timestamp) return "Sin fecha";
    return new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");
}

// ------------------------------------------------------
// Obtener lista de rentas
// ------------------------------------------------------
function listAllRents(limit = 100) {
    const rents = loadRents();
    return rents.slice(-limit).reverse();
}

module.exports = {
    loadRents,
    saveRents,
    getRent,
    isActive,
    formatDate,
    listAllRents
};