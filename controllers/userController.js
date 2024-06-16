const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Credential = require("../models/credential");
const User = require("../models/user");
const Code = require("../models/verificationCode");
const generateVerificationCode = require("../util/generateVerificationCode");
const sendMail = require("../util/sendMail");

const CLIENT_HOME_PAGE = "http://localhost:5174/";

exports.singUp = [
  body("fullName", "Invalid fullName")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Very short name!")
    .escape(),
  body("email", "Invalid email").trim().isLength({ min: 5 }).escape(),
  body("password", "Invalid password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Weak password!")
    .escape(),
  body("confirmation")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match!"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = await Credential.findOne({ email: req.body.email }).exec();
    if (email) {
      return res
        .status(400)
        .json({ errors: [{ path: "email", msg: "email Already Exist!" }] });
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err);
      const credential = new Credential({
        email: req.body.email,
        password: hashedPassword,
      });
      const user = new User({
        fullName: req.body.fullName,
        credentials: credential._id,
      });

      try {
        const [savedCredential, savedUser] = await Promise.all([
          credential.save(),
          user.save(),
        ]);

        if (savedUser && savedCredential) {
          // send verifiaction code to user mail
          const verifiactionCode = generateVerificationCode();
          await sendMail(req.body.email, user.fullName, verifiactionCode);

          // save verifiactionCode in database temporarely
          const code = new Code({
            userId: user._id,
            verificationCode: `${verifiactionCode}`,
          });
          await code.save();

          return res.status(201).json({ savedUser });
        }
        res.status(409).json({ message: "Sign up failed!" });
      } catch (err) {
        next(err);
      }
    });
  },
];

exports.login = [
  body("email", "Invalid email").trim().isLength({ min: 4 }).escape(),
  body("password", "Incorrect password").trim().isLength({ min: 8 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const credentials = await Credential.findOne({ email: email }).exec();

      if (email === credentials.email) {
        const match = await bcrypt.compare(password, credentials.password);
        if (!match) {
          return res.status(400).json({ message: "Invalid inputs" });
        }
        const options = {};
        options.expiresIn = "2d";
        const secret = process.env.SECRET;
        const user = await User.findOne({
          credentials: credentials._id,
        }).exec();
        const token = jwt.sign(
          { id: user._id, fullName: user.fullName },
          secret,
          options,
        );

        return res.json({
          message: "Auth passed",
          token: token,
          userId: user._id,
          expiresIn: options.expiresIn,
          isActive: user.isActive,
        });
      }
      return res.status(401).json({
        message: "Auth failed",
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.activateAccount = [
  body("verificationCode", "Invalid code")
    .trim()
    .isLength({ min: 6 })
    .isInt()
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const verificationCode = await Code.findOne({
        userId: req.user._id,
      });
      if (!verificationCode) {
        return res.status(409).json({
          message: "Verification failed! may be the code was expired",
        });
      }

      const user = await User.findOne({ _id: req.user._id });
      user.isActive = true;
      await user.save();

      res.json({ message: "Account activated" });
    } catch (err) {
      next(err);
    }
  },
];

exports.oAuthRedirectCallback = async (req, res, next) => {
  const { userId } = req.user;
  try {
    const verificationCode = generateVerificationCode();
    // save verifiactionCode in database temporarely
    const code = new Code({
      userId: userId,
      verificationCode: `${verificationCode}`,
    });
    await code.save();
    res.redirect(
      `${CLIENT_HOME_PAGE}?userId=${userId}&code=${verificationCode}`,
    );
  } catch (err) {
    next(err);
  }
};

exports.oAuthLogin = [
  body("userId", "Invalid userId").trim().isLength({ min: 1 }).escape(),
  body("code", "Invalid code").trim().isLength({ min: 6 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({
        _id: req.body.userId,
      });
      if (!user || !user.isOAuth) {
        return res.status(409).json({
          message: "Activation failed!",
        });
      }

      const savedCode = await Code.findOne({ userId: req.body.userId }).exec();

      if (!savedCode) {
        return res.status(401).json({
          message: "Activation failed!",
        });
      }

      if (savedCode.verificationCode === req.body.code) {
        const options = {};
        options.expiresIn = "2d";
        const secret = process.env.SECRET;
        const token = jwt.sign(
          { id: user._id, fullName: user.fullName },
          secret,
          options,
        );

        res.json({
          message: "Account activated",
          token,
          expiresIn: options.expiresIn,
          isActive: user.isActive,
        });
      }
    } catch (err) {
      next(err);
    }
  },
];

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne(
      { _id: req.params.id },
      "fullName githubId isOAuth location imgUrl isActive",
    ).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserPassword = [
  body("password", "Invalid password").trim().isLength({ min: 8 }).escape(),
  body("confirmation", "Passwords does not match").custom(
    (value, { req }) => req.body.password === value,
  ),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({
        _id: req.user.id,
      }).exec();
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      // if it is OAuth provider other than google OAuth
      if (!user.credentials) {
        return res
          .status(409)
          .json({ message: "Can not Modify OAuth provider's password" });
      }
      const credentials = await Credential.findOne({
        _id: user.credentials,
      }).exec();

      // if it is google OAuth
      if (credentials.password === "OAuthPassword") {
        return res.status(409).json({
          message:
            "You are Signed with google OAuth, we can not change google passwords",
        });
      }
      console.log("run");
      // if it is email sign up
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) return next(err);
        console.log("old password:", credentials.password);
        credentials.password = hashedPassword;
        const newCredentials = await credentials.save();
        if (!newCredentials) {
          return res.status(409).json({ message: "Password upadate failed!" });
        }
        console.log("new password:", newCredentials.password);
        return res.json({ message: "password Update successfully" });
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.updateUserInfo = [
  body("fullName", "Invalid full name").trim().isLength({ min: 3 }).escape(),
  body("location", "Invalid location").trim().isLength({ min: 2 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({ _id: req.user.id }).exec();
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }

      user.fullName = req.body.fullName;
      user.location = req.body.location;

      const newUser = await user.save();
      if (!newUser) {
        return res.status(409).json({ message: "Update user info failed" });
      }
      res.json({ message: "Update user info succeded" });
    } catch (err) {
      next(err);
    }
  },
];
