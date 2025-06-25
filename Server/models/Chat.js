const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  messages: [
    {
      role: String, // "user" | "bot"
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Chat', chatSchema);
