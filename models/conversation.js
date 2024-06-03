const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  initiator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: [Schema.Types.ObjectId],
    ref: "Message",
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);
