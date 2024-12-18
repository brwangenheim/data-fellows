const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Route to get all users
router.get("/", userController.getAllUsers);

// Route to get user by ID
router.get("/:user_id", userController.getUserById);

// Route to get user by name
router.get("/:name", userController.getUserByName);

// Route to delete user
// router.get("/:name", userController.deleteUser);

module.exports = router;
