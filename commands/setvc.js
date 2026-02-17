import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} from "discord.js"

export default {
  name: "setvc",
  description: "Set voice channel dengan select menu",
  async execute(msg, args, { connectVoice }) {

    if (!msg.guild) return
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("Butuh permission Administrator.")

    const menu = new ChannelSelectMenuBuilder()
      .setCustomId("select-voice-channel")
      .setPlaceholder("Pilih voice channel")
      .setChannelTypes(ChannelType.GuildVoice)
      .setMinValues(1)
      .setMaxValues(1)

    const row = new ActionRowBuilder().addComponents(menu)

    const reply = await msg.reply({
      content: "Pilih voice channel:",
      components: [row]
    })

    const collector = reply.createMessageComponentCollector({
      time: 30000
    })

    collector.on("collect", async interaction => {
      if (interaction.user.id !== msg.author.id)
        return interaction.reply({
          content: "Ini bukan buat kamu.",
          ephemeral: true
        })

      const channelId = interaction.values[0]
      const channel = await msg.guild.channels.fetch(channelId)

      if (!channel || !channel.isVoiceBased())
        return interaction.reply({
          content: "Channel tidak valid.",
          ephemeral: true
        })

      if (!global.db.data.voice) global.db.data.voice = {}
      global.db.data.voice[msg.guild.id] = { channelId }
      await global.db.write()

      await connectVoice(msg.guild.id, channelId)

      await interaction.update({
        content: `Voice diset ke ${channel.name}`,
        components: []
      })

      collector.stop()
    })

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await reply.edit({
          content: "Waktu habis.",
          components: []
        })
      }
    })
  }
}
