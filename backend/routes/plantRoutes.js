// # Routes for API (e.g., uploading images, viewing plant data)

// POST /upload: Uploads a plant image with metadata.
// GET /plants: Retrieves all plants with their uploaded images.
// POST /users: Registers a new user.
// GET /users/:user_id: Retrieves a user by their ID.

const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");

// Route to get all plants
router.get("/", plantController.getAllPlants);

// Route to get a plant by its ID
router.get("/:plant_id", plantController.getPlantById);

// Route to get a plant by its name
// router.get('/:plant_name', plantController.getPlantByName);

module.exports = router;
