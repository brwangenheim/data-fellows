// TODO:
// updateUpload - Updates metadata of an upload.
// getUploadsByDateRange (optional) - Fetches uploads within a date range.
// searchUploadsByLocation (optional) - Searches uploads based on proximity to a location.

const Upload = require("../models/uploadModel");
const Plant = require("../models/plantModel");

const { Op } = require("sequelize");

// Create a new upload
exports.uploadImage = async (req, res) => {
  const { plant_id, user_id, photo, location } = req.body;

  try {
    const upload = await Upload.create({ plant_id, user_id, photo, location });
    res.status(201).json(upload);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image." });
  }
};

// Get all uploads
exports.getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.findAll();
    res.status(200).json(uploads);
  } catch (error) {
    console.error("Error fetching uploads:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch uploads." });
  }
};

// Get upload by ID
exports.getUploadById = async (req, res) => {
  const { id } = req.params;

  try {
    const upload = await Upload.findByPk(id);
    if (upload) {
      res.status(200).json(upload);
    } else {
      res.status(404).json({ error: "Upload not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upload." });
  }
};

// Get all uploads for a specific plantID
exports.getUploadsByPlantID = async (req, res) => {
  try {
    const plant_id = req.params.plant_id;
    const uploads = await Upload.findAll({ where: { plant_id } });
    res.status(200).json(uploads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching uploads: " + error.message });
  }
};

// Get all uploads for a specific userID
exports.getUploadsByUserID = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const uploads = await Upload.findAll({ where: { user_id } });
    res.status(200).json(uploads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching uploads: " + error.message });
  }
};

// Delete an upload
exports.deleteUpload = async (req, res) => {
  const { id } = req.params;

  try {
    const upload = await Upload.findByPk(id);
    if (upload) {
      await upload.destroy();
      res.status(200).json({ message: "Upload deleted successfully." });
    } else {
      res.status(404).json({ error: "Upload not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete upload." });
  }
};

// Get uploads within a date range
exports.getUploadsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query; // Get start and end dates from query parameters

  try {
    const uploads = await Upload.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Use Sequelize's Op.between for date range
        },
      },
    });
    res.status(200).json(uploads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch uploads." });
  }
};

// Fetch plant and associated upload data
exports.getUploadWithPlantById = async (req, res) => {
  try {
    const upload_id = req.params.upload_id;

    // Fetch the upload data by ID
    const upload = await Upload.findOne({
      where: { id: upload_id }, // Look for the upload with the given upload_id
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }

    // Fetch the associated plant data using the plant_id from the upload record
    const plant = await Plant.findByPk(upload.plant_id); // Use plant_id from the upload

    if (!plant) {
      return res.status(404).json({ error: "Associated plant not found" });
    }

    // Combine the upload and plant data
    const uploadWithPlant = {
      ...upload.dataValues, // Spread the upload data
      plant: plant.dataValues, // Add plant data to the response
    };

    res.status(200).json(uploadWithPlant);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching upload with plant data: " + error.message,
    });
  }
};

exports.getAllPlants = async (req, res) => {
  try {
    console.log("Fetching all plants...");
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

// Fetch plant and associated upload data by ID
exports.getPlantAndUploadById = async (req, res) => {
  try {
    const upload_id = req.params.upload_id;
    const upload = await Upload.findOne({ where: { upload_id } });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }

    const plant_id = upload.plant_id;

    // Fetch associated upload data by plant ID
    const plant = await Plant.findOne({ where: { plant_id: plant_id } });
    if (!plant) {
      return res.status(404).json({ error: "PLant not found" });
    }

    // Combine the plant and upload data
    const plantWithUpload = {
      ...upload.dataValues,
      species: plant.species,
      genus: plant.genus,
      family: plant.family,
      order: plant.order,
    };

    res.status(200).json(plantWithUpload);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching plant and upload data: " + error.message,
    });
  }
};

// controllers/uploadController.js

exports.getAllUploadsWithPlantData = async (req, res) => {
  try {
    // Fetch all uploads
    const uploads = await Upload.findAll();

    if (!uploads || uploads.length === 0) {
      return res.status(404).json({ error: "No uploads found" });
    }

    // Fetch plant data for each upload and combine the results
    const uploadsWithPlantData = [];

    for (let upload of uploads) {
      const plant = await Plant.findOne({
        where: { plant_id: upload.plant_id },
      });

      if (!plant) {
        return res
          .status(404)
          .json({ error: "Plant not found for upload ID " + upload.upload_id });
      }

      // Combine the upload data with the plant data
      const uploadWithPlant = {
        ...upload.dataValues,
        species: plant.species,
        genus: plant.genus,
        family: plant.family,
        order: plant.order,
      };

      uploadsWithPlantData.push(uploadWithPlant);
    }

    // Send the combined data back as JSON
    res.status(200).json(uploadsWithPlantData);
  } catch (error) {
    console.error("Error fetching uploads with plant data:", error);
    res.status(500).json({
      error: "Error fetching uploads with plant data: " + error.message,
    });
  }
};
