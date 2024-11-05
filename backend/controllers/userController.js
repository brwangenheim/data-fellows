// newUser - Returns all new users
// getAllUsers - Fetches all users.
// getUserByName - Fetches a specific user by its user name.
// getUserByEmail - Fetches a specific upload by its email.
// updateUser - Updates a user's info
// deleteUser - Deletes a user's info
// getUploadsByDateRange (optional) - Fetches uploads within a date range.
// searchUploadsByLocation (optional) - Searches uploads based on proximity to a location.

const User = require("../models/userModel");

// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log("User model:", User);
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users: " + error.message });
  }
};

// Fetch user by ID
exports.getUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await User.findByPk(user_id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching user: " + error.message });
  }
};

// Fetch user by name
exports.getUserByName = async (req, res) => {
  try {
    const name = req.params.name;
    const user = await User.findOne({ where: { name } });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching user: " + error.message });
  }
};
