import mongoose from "mongoose"

// Define Voice Channel Schema
const voiceChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  channelId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Create Model
const VoiceChannelModel = mongoose.model("voicechannel", voiceChannelSchema)

// Database utilities
export const db = {
  data: {
    voice: {}
  },
  
  async connect(mongoUri) {
    try {
      await mongoose.connect(mongoUri || process.env.MONGODB_URI || "mongodb://localhost:27017/discord-bot")
      console.log("Database terhubung")
    } catch (err) {
      console.error("Gagal terhubung ke MongoDB:", err.message)
      throw err
    }
  },

  async read() {
    try {
      const voiceChannels = await VoiceChannelModel.find({})
      this.data.voice = {}
      voiceChannels.forEach(doc => {
        this.data.voice[doc.guildId] = { channelId: doc.channelId }
      })
      return this.data
    } catch (err) {
      console.error("Gagal membaca database:", err)
      return this.data
    }
  },

  async write() {
    // Already handled by direct writes in setChannel and deleteChannel
    return true
  },

  async setChannel(guildId, channelId) {
    try {
      const result = await VoiceChannelModel.findOneAndUpdate(
        { guildId },
        { guildId, channelId, updatedAt: new Date() },
        { upsert: true, new: true }
      )
      this.data.voice[guildId] = { channelId }
      return result
    } catch (err) {
      console.error("Gagal menyimpan channel:", err)
      throw err
    }
  },

  async deleteChannel(guildId) {
    try {
      await VoiceChannelModel.findOneAndDelete({ guildId })
      delete this.data.voice[guildId]
      return true
    } catch (err) {
      console.error("Gagal menghapus channel:", err)
      throw err
    }
  },

  async getChannel(guildId) {
    try {
      const doc = await VoiceChannelModel.findOne({ guildId })
      return doc?.channelId || null
    } catch (err) {
      console.error("Gagal mengambil channel:", err)
      return null
    }
  }
}

export default db
