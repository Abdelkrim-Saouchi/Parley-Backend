const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const credentialSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, require: true, default: "OAuthPassword" },
});

module.exports = mongoose.model("Credential", credentialSchema);
