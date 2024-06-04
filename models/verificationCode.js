const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CodeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 60, // 1 min
    default: Date.now(),
  },
});

module.exports = mongoose.model("Code", CodeSchema);
