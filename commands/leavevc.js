import { PermissionsBitField } from "discord.js"

export default {
  name: "leavevc",
  description: "Keluar dari voice dan hapus config",
  async execute(msg, args, { voiceConnections }) {
    if (!msg.guild) return
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("Butuh permission Administrator.")

    const guildId = msg.guild.id

    if (voiceConnections.has(guildId)) {
      voiceConnections.get(guildId).destroy()
      voiceConnections.delete(guildId)
    }

    if (global.db.data.voice?.[guildId]) {
      delete global.db.data.voice[guildId]
      await global.db.write()
    }

    return msg.reply("Bot keluar dari voice dan config dihapus.")
  }
}
