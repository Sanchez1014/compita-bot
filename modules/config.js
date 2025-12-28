// ======================================================
// CONFIG.JS — CONFIGURACIÓN POR GRUPO (WELCOME, ANTILINK, ANTIFLOOD)
// ======================================================

const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(__dirname, "../database/config.json");

// Asegurar archivo
if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({}));
}

// ------------------------------------------------------
// Cargar configuración
// ------------------------------------------------------
function loadConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_FILE));
}

// ------------------------------------------------------
// Guardar configuración
// ------------------------------------------------------
function saveConfig(data) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// Obtener configuración de un grupo
// ------------------------------------------------------
function getChatConfig(groupJid) {
    const cfg = loadConfig();

    if (!cfg[groupJid]) {
        cfg[groupJid] = {
            welcome: false,
            antilink: false,
            antiflood: false,
            maxFloodMessages: 5,
            floodIntervalMs: 5000
        };
        saveConfig(cfg);
    }

    return cfg[groupJid];
}

// ------------------------------------------------------
// Establecer configuración
// ------------------------------------------------------
function setChatConfig(groupJid, key, value) {
    const cfg = loadConfig();

    if (!cfg[groupJid]) {
        cfg[groupJid] = {};
    }

    cfg[groupJid][key] = value;
    saveConfig(cfg);
}

module.exports = {
    getChatConfig,
    setChatConfig
};