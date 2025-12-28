// ===============================
// COMPITA — SISTEMA PROFESIONAL
// ===============================

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const P = require('pino')

// SISTEMAS
const { isOwner } = require('./config')
const { generateKey, checkOwnerPermission, listKeys } = require('./modules/keys')
const { activarKeyEnGrupo } = require('./modules/activateKey')
const {
  isGroupActive,
  getGroupRent,
  listRents,
  extendGroupRent
} = require('./modules/rent')
const { getChatConfig } = require('./modules/config')
const { isAdminInGroup, containsLink, checkFlood } = require('./modules/moderation')

// ===============================
// START
// ===============================
async function startCompita() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  // ===============================
  // RECONEXIÓN
  // ===============================
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Sesión cerrada, borra auth/')
      } else {
        console.log('♻️ Reconectando...')
        startCompita()
      }
    }
    if (connection === 'open') console.log('✅ COMPITA ONLINE')
  })

  // ===============================
  // MENSAJES
  // ===============================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message) return

    const from = msg.key.remoteJid
    const sender = msg.key.participant || from
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    if (!body) return

    const isGroup = from.endsWith('@g.us')

    // ===============================
    // MODERACIÓN
    // ===============================
    if (isGroup) {
      const cfg = getChatConfig(from)
      const metadata = await sock.groupMetadata(from)
      const botIsAdmin = isAdminInGroup(metadata.participants, sock.user.id)

      if (cfg.antilink && containsLink(body) && botIsAdmin) {
        await sock.sendMessage(from, { text: '🚫 Enlaces no permitidos.' })
        await sock.groupParticipantsUpdate(from, [sender], 'remove')
        return
      }

      if (cfg.antiflood) {
        const flood = checkFlood(
          from,
          sender,
          cfg.maxFloodMessages || 5,
          cfg.floodIntervalMs || 5000
        )
        if (flood && botIsAdmin) {
          await sock.sendMessage(from, { text: '🚫 Flood detectado.' })
          await sock.groupParticipantsUpdate(from, [sender], 'remove')
          return
        }
      }
    }

    // ===============================
    // COMANDOS
    // ===============================
    if (!body.startsWith('.')) return

    const args = body.trim().split(/\s+/)
    const cmd = args.shift().slice(1).toLowerCase()

    const freeCommands = ['activar', 'menu', 'help', 'ayuda', 'hola', 'mi-plan', 'jid']

    if (isGroup && !freeCommands.includes(cmd)) {
      if (!isGroupActive(from)) {
        return sock.sendMessage(from, {
          text: '⚠️ Este grupo no tiene renta activa.\nUsa: .activar KEY'
        })
      }
    }

    // ===============================
    // COMANDOS BASE
    // ===============================
    if (cmd === 'hola') {
      return sock.sendMessage(from, { text: '👋 Hola, soy *Compita*.' })
    }

    if (cmd === 'menu' || cmd === 'help' || cmd === 'ayuda') {
      return sock.sendMessage(from, {
        text:
`📋 *MENÚ COMPITA*

Base:
.hola
.menu
.mi-plan
.activar KEY

Owner:
.genkey
.keys
.rentas
.renovar 30`
      })
    }

    if (cmd === 'jid') {
      return sock.sendMessage(from, { text: `📎 Tu JID:\n${sender}` })
    }

    // ===============================
    // ACTIVAR
    // ===============================
    if (cmd === 'activar') {
      return activarKeyEnGrupo(sock, from, sender, args[0])
    }

    if (cmd === 'mi-plan') {
      if (!isGroup) return
      const r = getGroupRent(from)
      if (!r) {
        return sock.sendMessage(from, { text: '❌ Sin renta activa.' })
      }
      return sock.sendMessage(from, {
        text:
`📦 PLAN ACTUAL
Plan: ${r.plan}
Expira: ${r.expiresAt}`
      })
    }

    // ===============================
    // OWNER
    // ===============================
    if (cmd === 'genkey') {
      const pass = args[0]
      const days = parseInt(args[1])
      const plan = (args[2] || 'BASIC').toUpperCase()

      if (!checkOwnerPermission(sender, pass))
        return sock.sendMessage(from, { text: '❌ Sin permisos.' })

      if (!days || days <= 0)
        return sock.sendMessage(from, { text: '❌ Días inválidos.' })

      const { key } = generateKey(plan, days)

      return sock.sendMessage(from, {
        text:
`🔑 KEY GENERADA

Key: ${key}
Plan: ${plan}
Días: ${days}`
      })
    }

    if (cmd === 'keys' && isOwner(sender)) {
      const keys = listKeys(20)
      let txt = '🔑 KEYS\n\n'
      keys.forEach(k => {
        txt += `${k.key} | ${k.plan} | Usada: ${k.used}\n`
      })
      return sock.sendMessage(from, { text: txt })
    }

    if (cmd === 'rentas' && isOwner(sender)) {
      const rents = listRents(50)
      let txt = '📦 RENTAS\n\n'
      rents.forEach(r => {
        txt += `${r.groupJid}\nExpira: ${r.expiresAt}\n\n`
      })
      return sock.sendMessage(from, { text: txt })
    }

    if (cmd === 'renovar' && isOwner(sender)) {
      const days = parseInt(args[0])
      const r = extendGroupRent(from, days)
      if (!r) return sock.sendMessage(from, { text: '❌ No existe renta.' })
      return sock.sendMessage(from, {
        text: `✅ Renovado\nNueva fecha: ${r.expiresAt}`
      })
    }
  })
}

startCompita()
