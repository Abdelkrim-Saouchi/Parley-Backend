const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const credentialSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  password: { type: String, require: true },
});

module.exports = mongoose.model("Credential", credentialSchema);
