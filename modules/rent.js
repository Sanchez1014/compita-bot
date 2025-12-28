const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../database/rents.json");

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

function loadRents() {
    return JSON.parse(fs.readFileSync(FILE));
}

function listAllRents() {
    return loadRents();
}

module.exports = { loadRents, listAllRents };