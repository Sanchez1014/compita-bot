const fs = require('fs');
const path = require('path');

const KEYS_PATH = path.join(__dirname, '..', 'data', 'keys.json');

function loadKeys() {
    if (!fs.existsSync(KEYS_PATH)) return {};
    const raw = fs.readFileSync(KEYS_PATH, 'utf8') || '{}';
    return JSON.parse(raw);
}

function saveKeys(data) {
    fs.writeFileSync(KEYS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function randomPart() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function generateKey(plan = 'BASIC', days = 30) {
    const key = `COMPITA-${randomPart()}-${randomPart()}-${randomPart()}`;
    const keys = loadKeys();
    keys[key] = {
        plan,
        days,
        used: false,
        createdAt: Date.now()
    };
    saveKeys(keys);
    return { key, data: keys[key] };
}

function validateKey(key) {
    const keys = loadKeys();
    return keys[key] || null;
}

function useKey(key, groupJid) {
    const keys = loadKeys();
    if (!keys[key]) return false;
    keys[key].used = true;
    keys[key].usedInGroup = groupJid;
    keys[key].usedAt = Date.now();
    saveKeys(keys);
    return true;
}

module.exports = {
    loadKeys,
    saveKeys,
    generateKey,
    validateKey,
    useKey
};