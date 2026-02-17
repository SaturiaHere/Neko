export default {
  name: "help",
  description: "Tampilkan daftar command",
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
};
