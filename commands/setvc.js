import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js"

export default {
  name: "setvc",
  description: "Set voice channel dengan select menu",
  data: new SlashCommandBuilder()
    .setName("setvc")
    .setDescription("Set voice channel dengan select menu")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
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

      try {
        await global.db.setChannel(msg.guild.id, channelId)
        await connectVoice(msg.guild.id, channelId)

        await interaction.update({
          content: `Voice diset ke ${channel.name}`,
          components: []
        })
      } catch (err) {
        console.error("Gagal menyimpan voice channel:", err)
        await interaction.reply({
          content: "Gagal menyimpan konfigurasi.",
          ephemeral: true
        })
      }

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
  },
  async executeSlash(interaction, { connectVoice }) {
    if (!interaction.guild) return
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return interaction.reply({ content: "Butuh permission Administrator.", ephemeral: true })

    const menu = new ChannelSelectMenuBuilder()
      .setCustomId("select-voice-channel-slash")
      .setPlaceholder("Pilih voice channel")
      .setChannelTypes(ChannelType.GuildVoice)
      .setMinValues(1)
      .setMaxValues(1)

    const row = new ActionRowBuilder().addComponents(menu)

    await interaction.reply({
      content: "Pilih voice channel:",
      components: [row]
    })

    const message = await interaction.fetchReply()

    const collector = message.createMessageComponentCollector({
      time: 30000
    })

    collector.on("collect", async componentInteraction => {
      if (componentInteraction.user.id !== interaction.user.id)
        return componentInteraction.reply({
          content: "Ini bukan buat kamu.",
          ephemeral: true
        })

      const channelId = componentInteraction.values[0]
      const channel = await interaction.guild.channels.fetch(channelId)

      if (!channel || !channel.isVoiceBased())
        return componentInteraction.reply({
          content: "Channel tidak valid.",
          ephemeral: true
        })

      try {
        await global.db.setChannel(interaction.guild.id, channelId)
        await connectVoice(interaction.guild.id, channelId)

        await componentInteraction.update({
          content: `Voice diset ke ${channel.name}`,
          components: []
        })
      } catch (err) {
        console.error("Gagal menyimpan voice channel:", err)
        await componentInteraction.reply({
          content: "Gagal menyimpan konfigurasi.",
          ephemeral: true
        })
      }

      collector.stop()
    })

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await message.edit({
          content: "Waktu habis.",
          components: []
        })
      }
    })
  }
}
