const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../database/config.json");

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

function load() {
    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getChatConfig(group) {
    const cfg = load();

    if (!cfg[group]) {
        cfg[group] = {
            welcome: false,
            antilink: false,
            antiflood: false
        };
        save(cfg);
    }

    return cfg[group];
}

function setChatConfig(group, key, value) {
    const cfg = load();

    if (!cfg[group]) cfg[group] = {};

    cfg[group][key] = value;

    save(cfg);
}

module.exports = { getChatConfig, setChatConfig };