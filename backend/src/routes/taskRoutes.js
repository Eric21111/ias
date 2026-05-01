const express = require("express");
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.use(authenticate);
router.get("/", taskController.getTasks);
router.post("/", taskController.postTask);
router.patch("/:id", taskController.patchTask);
router.delete("/:id", taskController.removeTask);

module.exports = router;
