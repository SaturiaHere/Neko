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

    try {
      await global.db.deleteChannel(guildId)
    } catch (err) {
      console.error("Gagal menghapus voice channel config:", err)
    }

    return msg.reply("Bot keluar dari voice dan config dihapus.")
  }
}
