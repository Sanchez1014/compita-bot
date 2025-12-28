const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../database/keys.json");

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

function load() {
    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function checkOwnerPermission(sender, pass) {
    return sender === "195928086569094@lid" && pass === "CARNITASM";
}

function generateKey(plan, days) {
    const keys = load();

    const key = "COMPITA-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    keys.push({
        key,
        plan,
        days,
        used: false,
        createdAt: Date.now()
    });

    save(keys);

    return { key };
}

function listKeys(limit = 20) {
    return load().slice(-limit).reverse();
}

module.exports = { generateKey, listKeys, checkOwnerPermission };