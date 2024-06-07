const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

module.exports = new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/users/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  },
);
