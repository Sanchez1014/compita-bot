const fs = require("fs");
const path = require("path");
const { useKey } = require("./keys");

const FILE = path.join(__dirname, "../database/rents.json");

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

function load() {
    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function isGroupActive(group) {
    const rents = load();
    const r = rents.find(x => x.groupJid === group);
    if (!r) return false;
    return Date.now() < r.expiresAt;
}

function getGroupRent(group) {
    const rents = load();
    return rents.find(x => x.groupJid === group) || null;
}

function activarKeyEnGrupo(sock, group, sender, key) {
    const rents = load();

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const data = {
        groupJid: group,
        key,
        plan: "BASIC",
        expiresAt
    };

    const filtered = rents.filter(x => x.groupJid !== group);
    filtered.push(data);

    save(filtered);

    return sock.sendMessage(group, {
        text:
`✅ RENTA ACTIVADA

Plan: BASIC
Expira: ${expiresAt}`
    });
}

function extendGroupRent(group, days) {
    const rents = load();
    const r = rents.find(x => x.groupJid === group);
    if (!r) return null;

    r.expiresAt += days * 24 * 60 * 60 * 1000;

    save(rents);
    return r;
}

function listRents(limit = 50) {
    return load().slice(-limit).reverse();
}

module.exports = {
    activarKeyEnGrupo,
    isGroupActive,
    getGroupRent,
    extendGroupRent,
    listRents
};