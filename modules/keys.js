// ======================================================
// KEYS.JS — SISTEMA PROFESIONAL DE GENERACIÓN DE KEYS
// ======================================================

const fs = require("fs");
const path = require("path");

const KEYS_FILE = path.join(__dirname, "../database/keys.json");

// Asegurar archivo
if (!fs.existsSync(KEYS_FILE)) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify([]));
}

// ------------------------------------------------------
// Cargar keys
// ------------------------------------------------------
function loadKeys() {
    return JSON.parse(fs.readFileSync(KEYS_FILE));
}

// ------------------------------------------------------
// Guardar keys
// ------------------------------------------------------
function saveKeys(data) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// Validar owner con password
// ------------------------------------------------------
function checkOwnerPermission(sender, password) {
    const OWNER = "195928086569094@lid"; // tu JID real
    const PASS = "CARNITASM"; // tu password real

    return sender === OWNER && password === PASS;
}

// ------------------------------------------------------
// Generar key única
// ------------------------------------------------------
function generateKey(plan, days) {
    const keys = loadKeys();

    const key = "COMPITA-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const data = {
        key,
        plan,
        days,
        used: false,
        usedInGroup: null,
        createdAt: Date.now()
    };

    keys.push(data);
    saveKeys(keys);

    return { key, data };
}

// ------------------------------------------------------
// Listar keys
// ------------------------------------------------------
function listKeys(limit = 20) {
    const keys = loadKeys();
    return keys.slice(-limit).reverse();
}

// ------------------------------------------------------
// Marcar key como usada
// ------------------------------------------------------
function useKey(key, groupJid) {
    const keys = loadKeys();
    const k = keys.find((x) => x.key === key);

    if (!k) return null;
    if (k.used) return null;

    k.used = true;
    k.usedInGroup = groupJid;

    saveKeys(keys);
    return k;
}

module.exports = {
    generateKey,
    listKeys,
    checkOwnerPermission,
    useKey
};