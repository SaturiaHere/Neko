export default {
  name: "ping",
  description: "Balas dengan Pong dan latency",
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
}
