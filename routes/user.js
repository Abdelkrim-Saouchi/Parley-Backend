const router = require("express").Router();
const userController = require("../controllers/userController");
const passport = require("passport");

// Sign up route
router.post("/signup", userController.singUp);

// Log in route
router.post("/login", userController.login);

// Activate Account route
router.post(
  "/activate",
  passport.authenticate("jwt", { session: false }),
  userController.activateAccount,
);

// Authenticate with google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    console.log("Profile 2:", req.user);
    res.redirect("http://localhost:5174/");
  },
);

module.exports = router;
