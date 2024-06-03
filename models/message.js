const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("Message", messageSchema);
