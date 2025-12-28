const flood = new Map();

function isAdminInGroup(participants, myId) {
    const p = participants.find(x => x.id === myId);
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function checkFlood(group, sender, max = 5, interval = 5000) {
    const key = `${group}:${sender}`;
    const now = Date.now();

    if (!flood.has(key)) {
        flood.set(key, { count: 1, first: now });
        return false;
    }

    const data = flood.get(key);

    if (now - data.first > interval) {
        flood.set(key, { count: 1, first: now });
        return false;
    }

    data.count++;

    if (data.count >= max) {
        flood.delete(key);
        return true;
    }

    return false;
}

module.exports = { isAdminInGroup, checkFlood };