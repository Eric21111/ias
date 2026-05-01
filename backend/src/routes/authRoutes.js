const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/verify", authController.verifyToken);
router.post("/google", authController.googleSignIn);
router.get("/me", authenticate, authController.me);

module.exports = router;
