const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  nextChatNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatNode', default: null },
  finalAnswerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatNode', default: null }
});

const ChatNodeSchema = new mongoose.Schema({
  text: { type: String, required: false }, // טקסט שמוצג למשתמש (שאלה או תגובה)
  answer: { type: String, required: false }, // תשובה סופית אם זה צומת סופי
  options: [optionSchema],
  isInitial: { type: Boolean, default: false },
  relatedKeywords: [String]
});

module.exports = mongoose.model('ChatNode', ChatNodeSchema);
