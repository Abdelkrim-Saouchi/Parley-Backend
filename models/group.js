const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: String,
  members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  joinRequests: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  messages: {
    type: [Schema.Types.ObjectId],
    ref: "Message",
  },
});

module.exports = mongoose.model("Group", groupSchema);
