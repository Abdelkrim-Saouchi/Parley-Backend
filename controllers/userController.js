const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Credential = require("../models/credential");
const User = require("../models/user");

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
