const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");

// Route to get all plants
router.get("/", plantController.getAllPlants);
router.get("/:plant_id", plantController.getPlantById);

// Route to get a plant by its name
// router.get('/:plant_name', plantController.getPlantByName);

module.exports = router;
