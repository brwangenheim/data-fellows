// TODO:
// updateUpload - Updates metadata of an upload.
// getUploadsByDateRange (optional) - Fetches uploads within a date range.
// searchUploadsByLocation (optional) - Searches uploads based on proximity to a location.

const Upload = require("../models/uploadModel");
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
