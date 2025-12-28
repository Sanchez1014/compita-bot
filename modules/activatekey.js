const { validateKey, useKey } = require('./keys');
const { setGroupRent } = require('./rent');

async function activarKeyEnGrupo(sock, groupJid, sender, key) {
    if (!key) {
        return sock.sendMessage(groupJid, {
            text: '❌ Debes escribir la key.\nEjemplo: .activar COMPITA-XXXX-XXXX-XXXX'
        });
    }

    const data = validateKey(key);
    if (!data) {
        return sock.sendMessage(groupJid, {
            text: '❌ Key inválida o no existe.'
        });
    }

    if (data.used) {
        return sock.sendMessage(groupJid, {
            text: '❌ Esta key ya fue usada.'
        });
    }

    const expiresAt = new Date(Date.now() + data.days * 24 * 60 * 60 * 1000);

    setGroupRent(groupJid, {
        plan: data.plan,
        expiresAt,
        key
    });

    useKey(key, groupJid);

    return sock.sendMessage(groupJid, {
        text:
`✅ *KEY ACTIVADA*

Plan: ${data.plan}
Días: ${data.days}
Expira: ${expiresAt}`
    });
}

module.exports = { activarKeyEnGrupo };