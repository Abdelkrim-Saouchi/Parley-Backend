const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  credentials: {
    type: Schema.Types.ObjectId,
    ref: "Credential",
    required: true,
  },
  location: { type: String, default: "World Wide" },
  imgUrl: {
    type: String,
    // Temperoray image placeholder
    default:
      "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  friendRequests: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  friends: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  groups: {
    type: [Schema.Types.ObjectId],
    ref: "Group",
  },
  chatHistory: [
    { type: Schema.Types.ObjectId, ref: "Conversation" },
    { type: Schema.Types.ObjectId, ref: "Group" },
  ],
  ownGroups: {
    type: [Schema.Types.ObjectId],
    ref: "Group",
  },
});

module.exports = mongoose.model("User", userSchema);
