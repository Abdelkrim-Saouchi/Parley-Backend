const GithubStrategy = require("passport-github").Strategy;
require("dotenv").config();
const User = require("../models/user");
const Credential = require("../models/credential");
const clientHostName = require("../util/hostname");

module.exports = new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${clientHostName}/api/v1/users/github/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({
        githubId: profile.id,
      }).exec();
      console.log(user);
      if (user) {
        return done(null, { userId: user._id, fullName: user.fullName });
      }
      const newUser = new User({
        githubId: profile.id,
        fullName: profile.displayName,
        imgUrl: profile._json.avatar_url,
        location: profile._json.location,
        isOAuth: true,
        isActive: true,
      });

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
