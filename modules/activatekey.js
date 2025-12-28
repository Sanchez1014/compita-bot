// ======================================================
// ACTIVATEKEY.JS — SISTEMA PROFESIONAL DE RENTAS
// ======================================================

const fs = require("fs");
const path = require("path");
const { useKey } = require("./keys");

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
// Verificar si un grupo está activo
// ------------------------------------------------------
function isGroupActive(groupJid) {
    const rents = loadRents();
    const r = rents.find((x) => x.groupJid === groupJid);

    if (!r) return false;
    if (!r.expiresAt) return false;

    return Date.now() < r.expiresAt;
}

// ------------------------------------------------------
// Obtener información de renta del grupo
// ------------------------------------------------------
function getGroupRent(groupJid) {
    const rents = loadRents();
    return rents.find((x) => x.groupJid === groupJid) || null;
}

// ------------------------------------------------------
// Activar key en grupo
// ------------------------------------------------------
function activarKeyEnGrupo(sock, groupJid, sender, key) {
    const rents = loadRents();

    // Verificar si la key existe y no está usada
    const usedKey = useKey(key, groupJid);

    if (!usedKey) {
        return sock.sendMessage(groupJid, {
            text: "❌ Key inválida o ya usada."
        });
    }

    // Calcular expiración
    const expiresAt = Date.now() + usedKey.days * 24 * 60 * 60 * 1000;

    // Registrar renta
    const rentData = {
        groupJid,
        key,
        plan: usedKey.plan,
        expiresAt,
        activatedAt: Date.now()
    };

    // Eliminar renta previa si existe
    const filtered = rents.filter((x) => x.groupJid !== groupJid);
    filtered.push(rentData);

    saveRents(filtered);

    return sock.sendMessage(groupJid, {
        text:
`✅ *Renta activada correctamente*

Plan: ${usedKey.plan}
Días: ${usedKey.days}
Expira: ${new Date(expiresAt).toISOString().slice(0, 19).replace("T", " ")}

Compita está listo para trabajar en este grupo.`
    });
}

// ------------------------------------------------------
// Extender renta (renovar)
// ------------------------------------------------------
function extendGroupRent(groupJid, days) {
    const rents = loadRents();
    const r = rents.find((x) => x.groupJid === groupJid);

    if (!r) return null;

    const extra = days * 24 * 60 * 60 * 1000;
    r.expiresAt = (r.expiresAt || Date.now()) + extra;

    saveRents(rents);
    return r;
}

// ------------------------------------------------------
// Listar rentas
// ------------------------------------------------------
function listRents(limit = 50) {
    const rents = loadRents();
    return rents.slice(-limit).reverse();
}

module.exports = {
    activarKeyEnGrupo,
    isGroupActive,
    getGroupRent,
    extendGroupRent,
    listRents
};