const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  userText: { type: String, required: true },
  analysis: { type: Object, required: true },
  botReply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Session || mongoose.model("Session", SessionSchema);
