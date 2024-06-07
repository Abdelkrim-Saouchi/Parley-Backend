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
  passport.authenticate("google", {
    session: false,
  }),
  userController.oAuthRedirectCallback,
);

// Login OAuth account with custom jwt token
router.get("/Oauth/login", userController.oAuthLogin);

// test
router.get(
  "/info",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ message: "here is your info" });
  },
);

module.exports = router;
