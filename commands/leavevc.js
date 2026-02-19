import { PermissionsBitField, SlashCommandBuilder } from "discord.js"

export default {
  name: "leavevc",
  description: "Keluar dari voice dan hapus config",
  data: new SlashCommandBuilder()
    .setName("leavevc")
    .setDescription("Keluar dari voice dan hapus config")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
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
  },
  async executeSlash(interaction, { voiceConnections }) {
    if (!interaction.guild) return
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "Butuh permission Administrator.", ephemeral: true })
    }

    const guildId = interaction.guild.id

    if (voiceConnections.has(guildId)) {
      voiceConnections.get(guildId).destroy()
      voiceConnections.delete(guildId)
    }

    try {
      await global.db.deleteChannel(guildId)
    } catch (err) {
      console.error("Gagal menghapus voice channel config:", err)
    }

    return interaction.reply("Bot keluar dari voice dan config dihapus.")
  }
}
