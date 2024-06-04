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

module.exports = router;
