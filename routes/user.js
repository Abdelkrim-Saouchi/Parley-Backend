const router = require("express").Router();
const userController = require("../controllers/userController");

// Sign up route
router.post("/signup", userController.singUp);

module.exports = router;
