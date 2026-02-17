import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js"
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from "@discordjs/voice"
import yargs from "yargs/yargs"
import db from "./lib/db.js"
import fs from "fs/promises"
import path from "path"
import { pathToFileURL } from "url"

global.opts = new Object(
  yargs(process.argv.slice(2)).exitProcess(false).parse(),
)

global.db = db
global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
  return await global.db.read()
}

const TOKEN = process.env.TOKEN
if (!TOKEN) {
  console.error("TOKEN tidak ditemukan.")
  process.exit(1)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
})

const commands = new Map()
const voiceConnections = new Map()

async function loadCommands(dir = path.join(process.cwd(), "commands")) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        await loadCommands(full)
      } else if (ent.isFile() && full.endsWith(".js")) {
        try {
          const mod = await import(pathToFileURL(full).href)
          const cmd = mod.default || mod
          if (cmd && cmd.name) commands.set(cmd.name, cmd)
        } catch (e) {
          console.error("Failed to load command:", full, e)
        }
      }
    }
  } catch {}
}

async function connectVoice(guildId, channelId) {
  try {
    const guild = await client.guilds.fetch(guildId)
    const channel = await guild.channels.fetch(channelId)

    if (!channel || !channel.isVoiceBased()) {
      console.log(`Channel tidak valid di guild ${guildId}`)
      return
    }

    if (voiceConnections.has(guildId)) {
      voiceConnections.get(guildId).destroy()
      voiceConnections.delete(guildId)
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guildId,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: false
    })

    voiceConnections.set(guildId, connection)

    await entersState(connection, VoiceConnectionStatus.Ready, 20000)

    connection.on("stateChange", (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        console.log(`Voice disconnect di guild ${guildId}, reconnecting...`)
        setTimeout(() => connectVoice(guildId, channelId), 5000)
      }
    })

    console.log(`Join voice di guild ${guildId}`)

  } catch (err) {
    console.log(`Gagal join guild ${guildId}`, err)
  }
}

client.once("ready", async () => {
  try {
    // Connect ke MongoDB
    await global.db.connect()
  } catch (err) {
    console.error("Gagal mulai bot:", err.message)
    process.exit(1)
  }

  await loadCommands()
  await loadDatabase()

  if (!global.db.data.voice) global.db.data.voice = {}

  console.log(`Bot online sebagai ${client.user.tag}`)

  for (const guildId of Object.keys(global.db.data.voice)) {
    const channelId = global.db.data.voice[guildId]?.channelId
    if (channelId) {
      await connectVoice(guildId, channelId)
    }
  }
})

client.on("messageCreate", async (msg) => {
  if (!msg.guild) return
  if (msg.author.bot) return

  const prefix = "."
  if (!msg.content.startsWith(prefix)) return

  const args = msg.content.slice(prefix.length).trim().split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (commands.has(command)) {
    const cmd = commands.get(command)
    try {
      await cmd.execute(msg, args, { commands, connectVoice, voiceConnections })
    } catch (e) {
      console.error(`Error executing command ${command}:`, e)
      try { await msg.reply("Terjadi masalah saat menjalankan perintah.") } catch {}
    }
    return
  }
})

client.login(TOKEN)
