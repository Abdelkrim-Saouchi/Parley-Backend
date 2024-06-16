const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const User = require("../models/user");
const Credential = require("../models/credential");
const clientHostName = require("../util/hostname");

module.exports = new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${clientHostName}/api/v1/users/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const credentials = await Credential.findOne({
        email: profile._json.email,
      }).exec();
      if (credentials) {
        const user = await User.findOne({
          credentials: credentials._id,
        }).exec();
        if (user) {
          return done(null, { userId: user._id, fullName: user.fullName });
        }
      }
      const newUserCredentials = new Credential({
        email: profile._json.email,
      });
      const newUser = new User({
        fullName: profile.displayName,
        credentials: newUserCredentials._id,
        imgUrl: profile._json.picture,
        isOAuth: true,
        isActive: true,
      });

      await newUserCredentials.save();
      const savedUser = await newUser.save();
      return done(null, {
        userId: savedUser._id,
        fullName: savedUser.fullName,
      });
    } catch (err) {
      return done(err);
    }
  },
);
