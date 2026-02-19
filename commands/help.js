import { SlashCommandBuilder } from "discord.js"

export default {
  name: "help",
  description: "Tampilkan daftar command",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Tampilkan daftar command"),
  async execute(msg, args, context = {}) {
    try {
      const cmds = context.commands ? Array.from(context.commands.keys()) : [];
      if (cmds.length === 0) {
        return msg.reply("Tidak ada command yang terdaftar.");
      }
      const list = cmds.join("\n");
      const payload = `Daftar command:\n${list}`.slice(0, 1900);
      await msg.reply('```' + payload + '\n```');
    } catch (e) {
      console.error("help command error:", e);
      try { await msg.reply("Gagal menampilkan daftar command.") } catch (__) {}
    }
  },
  async executeSlash(interaction, context = {}) {
    try {
      const cmds = context.commands ? Array.from(context.commands.keys()) : [];
      if (cmds.length === 0) {
        return interaction.reply({ content: "Tidak ada command yang terdaftar.", ephemeral: true });
      }
      const list = cmds.join("\n");
      const payload = `Daftar command:\n${list}`.slice(0, 1900);
      await interaction.reply('```' + payload + '\n```');
    } catch (e) {
      console.error("help slash command error:", e);
      const reply = { content: "Gagal menampilkan daftar command.", ephemeral: true }
      if (interaction.replied) {
        await interaction.followUp(reply)
      } else {
        await interaction.reply(reply)
      }
    }
  },
};
