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

// Auth with facebook
// router.get("/facebook", passport.authenticate("facebook"));
//
// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   (req, res, next) => {
//     res.redirect("http://localhost:5174/");
//   },
// );
//

// Auth with github
router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  userController.oAuthRedirectCallback,
);

// Login OAuth account with custom jwt token
router.get("/Oauth/login", userController.oAuthLogin);

// GET user profile
router.get("/profile/:id", userController.getUserProfile);

// Update user info
router.post(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userController.updateUserInfo,
);

// Update user Password
router.post(
  "/profile/password",
  passport.authenticate("jwt", { session: false }),
  userController.updateUserPassword,
);

// Get user friends
router.get(
  "/friends",
  passport.authenticate("jwt", { session: false }),
  userController.getFriends,
);

// GET user Chat history
router.get(
  "/chats/history",
  passport.authenticate("jwt", { session: false }),
  userController.getChatHistory,
);

// GET specific conversation
router.get(
  "/chats/:conversationId",
  passport.authenticate("jwt", { session: false }),
  userController.getSpecificConversation,
);

// Search users and goups route
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  userController.searchContacts,
);

// test
router.get(
  "/info",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ message: "here is your info" });
  },
);

module.exports = router;
