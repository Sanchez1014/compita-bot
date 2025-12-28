const fs = require('fs');
const path = require('path');

const RENTS_PATH = path.join(__dirname, '..', 'data', 'rents.json');

function loadRents() {
    if (!fs.existsSync(RENTS_PATH)) return {};
    const raw = fs.readFileSync(RENTS_PATH, 'utf8') || '{}';
    return JSON.parse(raw);
}

function saveRents(data) {
    fs.writeFileSync(RENTS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function setGroupRent(groupJid, { plan, expiresAt, key }) {
    const rents = loadRents();
    rents[groupJid] = {
        plan,
        expiresAt,
        key,
        active: true,
        updatedAt: Date.now()
    };
    saveRents(rents);
    return rents[groupJid];
}

function getGroupRent(groupJid) {
    const rents = loadRents();
    return rents[groupJid] || null;
}

function isGroupActive(groupJid) {
    const r = getGroupRent(groupJid);
    if (!r) return false;
    if (!r.active) return false;
    if (!r.expiresAt) return true;
    return Date.now() <= new Date(r.expiresAt).getTime();
}

module.exports = {
    loadRents,
    saveRents,
    setGroupRent,
    getGroupRent,
    isGroupActive
};