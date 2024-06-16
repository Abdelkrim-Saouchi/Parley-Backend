const FacebookStartegy = require("passport-facebook");
require("dotenv").config();
const User = require("../models/user");
const Credential = require("../models/credential");
const hostName = require("../util/hostname");

module.exports = new FacebookStartegy(
  {
    clientID: process.env.F_CLIENT_ID,
    clientSecret: process.env.F_CLIENT_SECRET,
    callbackURL: `${hostName}/api/v1/users/facebook/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    return done(null, profile);
    //   try {
    //     const credentials = await Credential.findOne({
    //       email: profile._json.email,
    //     }).exec();
    //     if (credentials) {
    //       const user = await User.findOne({
    //         credentials: credentials._id,
    //       }).exec();
    //       if (user) {
    //         return done(null, { userId: user._id, fullName: user.fullName });
    //       }
    //     }
    //     const newUserCredentials = new Credential({
    //       email: profile._json.email,
    //     });
    //     const newUser = new User({
    //       fullName: profile.displayName,
    //       credentials: newUserCredentials._id,
    //       imgUrl: profile._json.picture,
    //       isOAuth: true,
    //       isActive: true,
    //     });
    //
    //     await newUserCredentials.save();
    //     const savedUser = await newUser.save();
    //     return done(null, {
    //       userId: savedUser._id,
    //       fullName: savedUser.fullName,
    //     });
    //   } catch (err) {
    //     return done(err);
    //   }
  },
);
