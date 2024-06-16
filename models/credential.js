const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const credentialSchema = new Schema({
  email: { type: String, required: true, default: null },
  password: { type: String, require: true, default: null },
});

module.exports = mongoose.model("Credential", credentialSchema);
