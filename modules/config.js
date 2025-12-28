// modules/config.js
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'config.json');

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8') || '{}';
    return JSON.parse(raw);
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

function getChatConfig(chatId) {
    const cfg = loadConfig();
    if (!cfg[chatId]) {
        cfg[chatId] = {
            welcome: false,
            antilink: false,
            antiflood: false,
            maxFloodMessages: 5,
            floodIntervalMs: 5000
        };
        saveConfig(cfg);
    }
    return cfg[chatId];
}

function setChatConfig(chatId, key, value) {
    const cfg = loadConfig();
    if (!cfg[chatId]) cfg[chatId] = {};
    cfg[chatId][key] = value;
    saveConfig(cfg);
    return cfg[chatId];
}

module.exports = {
    getChatConfig,
    setChatConfig
};