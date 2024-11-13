const Plant = require("../models/plantModel");
const Upload = require("../models/uploadModel");

// Fetch all plants
exports.getAllPlants = async (req, res) => {
  try {
    console.log("Plant model:", Plant);
    const plants = await Plant.findAll();
    res.status(200).json(plants);
  } catch (error) {
    res.status(500).json({ error: "Error fetching plants: " + error.message });
  }
};

// Fetch plant by ID
exports.getPlantById = async (req, res) => {
  try {
    const plant_id = req.params.plant_id;
    const plant = await Plant.findByPk(plant_id);
    if (plant) {
      res.status(200).json(plant);
    } else {
      res.status(404).json({ error: "Plant not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching plant: " + error.message });
  }
};
