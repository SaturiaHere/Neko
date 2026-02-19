import { SlashCommandBuilder } from "discord.js"

export default {
  name: "ping",
  description: "Balas dengan Pong dan latency",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Balas dengan Pong dan latency"),
  async execute(msg, args) {
    try {
      const sent = await msg.reply("Pinging...")
      const latency = sent.createdTimestamp - msg.createdTimestamp
      await sent.edit(`Pong! ${latency}ms`)
    } catch (err) {
      console.error("ping command error:", err)
      try { await msg.reply("Terjadi kesalahan saat menjalankan perintah ping.") } catch (e) {}
    }
  },
  async executeSlash(interaction) {
    try {
      const sent = await interaction.reply({ content: "Pinging...", fetchReply: true })
      const latency = sent.createdTimestamp - interaction.createdTimestamp
      await interaction.editReply(`Pong! ${latency}ms`)
    } catch (err) {
      console.error("ping slash command error:", err)
      const reply = { content: "Terjadi kesalahan saat menjalankan perintah ping.", ephemeral: true }
      if (interaction.replied) {
        await interaction.followUp(reply)
      } else {
        await interaction.reply(reply)
      }
    }
  }
}
