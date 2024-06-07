const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Credential = require("../models/credential");
const User = require("../models/user");
const Code = require("../models/verificationCode");
const generateVerificationCode = require("../util/generateVerificationCode");
const sendMail = require("../util/sendMail");

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
    console.log("email:", email);
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
          return res.status(201).json({ savedUser, savedCredential });
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
        const match = bcrypt.compare(password, credentials.password);
        if (match) {
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

          // send verifiaction code to user mail
          const verifiactionCode = generateVerificationCode();
          await sendMail(email, user.fullName, verifiactionCode);

          // save verifiactionCode in database temporarely
          const code = new Code({
            userId: user._id,
            verificationCode: `${verifiactionCode}`,
          });
          await code.save();

          return res.json({
            message: "Auth passed",
            token: token,
            userId: user._id,
            expiresIn: options.expiresIn,
            isActive: user.isActive,
          });
        }
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

exports.oAuthActivation = [
  body("userId", "Invalid userId").trim().isLength({ min: 1 }).escape(),
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
    } catch (err) {
      next(err);
    }
  },
];
