const router = require("express").Router();
const userController = require("../controllers/userController");
const passport = require("passport");

const CLIENT_HOME_PAGE = "http://localhost:5174/";

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
  (req, res) => {
    const { userId } = req.user;
    res.redirect(`${CLIENT_HOME_PAGE}?userId=${userId}`);
  },
);

// activate OAuth account with custom jwt token
router.get("/Oauth/activate", userController.oAuthActivation);

// test
router.get(
  "/info",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ message: "here is your info" });
  },
);

module.exports = router;
