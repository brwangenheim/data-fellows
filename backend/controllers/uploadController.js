// TODO:
// updateUpload - Updates metadata of an upload.

const Upload = require("../models/uploadModel");
const User = require("../models/userModel");
const Plant = require("../models/plantModel");
const moment = require("moment");

const { Op } = require("sequelize");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "data", "images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ dest: "../data/images" });

// new upload
exports.uploadImage = async (req, res) => {
  const {
    email,
    user_name,
    species,
    genus,
    family,
    order,
    date,
    latitude,
    longitude,
    linked,
    not_linked,
    flagged,
  } = req.body;
  const photo = req.file ? `${req.file.filename}` : null;

  try {
    // Check if the plant exists
    let plant = await Plant.findOne({
      where: { species, genus },
    });
    if (!plant) {
      // If plant doesn't exist, create a new plant
      plant = await Plant.create({
        species,
        genus,
        family,
        order,
      });
    }

    // Check if the user exists
    let user = await User.findOne({ where: { user_name } });
    if (!user) {
      // If user doesn't exist, create a new user
      user = await User.create({ user_name, email });
    }

    const location = `${latitude},${longitude}`;

    // Create the upload
    const upload = await Upload.create({
      plant_id: plant.plant_id, // Use the plant's ID
      user_id: user.user_id, // Use the user's ID
      photo: photo,
      location: location,
      date: date,
      linked: linked,
      not_linked: not_linked,
      flagged: flagged,
    });

    // Respond with the upload details
    res.status(201).json(upload);
  } catch (error) {
    console.error("Error in uploadImage:", error); // Detailed logging
    res
      .status(500)
      .json({ error: "Failed to upload image.", details: error.message }); // Send the error details in response
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
      return res.status(404).json({ error: "Plant not found" });
    }
    const user = await User.findOne({ where: { user_id: upload.user_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Combine the plant and upload data
    const plantWithUpload = {
      ...upload.dataValues,
      species: plant.species,
      genus: plant.genus,
      family: plant.family,
      order: plant.order,
      user: user.user_name,
      linked: upload.linked,
      linked: upload.not_linked,
      flagged: upload.flagged,
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

      const user = await User.findOne({
        where: { user_id: upload.user_id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found for upload ID " + upload.upload_id });
      }

      // Combine the upload data with the plant data
      const uploadWithPlant = {
        ...upload.dataValues,
        species: plant.species,
        genus: plant.genus,
        family: plant.family,
        order: plant.order,
        user_name: user.user_name,
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

// Update upload metadata
exports.updateUpload = async (req, res) => {
  const { id } = req.params; // Extract upload_id from the request params
  const {
    species,
    genus,
    family,
    order,
    latitude,
    longitude,
    linked,
    not_linked,
    flagged,
  } = req.body;

  try {
    // Find the upload by id
    const upload = await Upload.findByPk(id);
    if (!upload) {
      return res.status(404).json({ error: "Upload not found." });
    }

    // Find the associated plant using plant_id
    const plant = await Plant.findByPk(upload.plant_id);
    if (!plant) {
      return res
        .status(404)
        .json({ error: "Plant not found for this upload." });
    }

    let updatedLocation = upload.location; // Default to current location
    if (latitude && longitude) {
      updatedLocation = `${latitude},${longitude}`;
    }

    // If taxonomic information is updated, update the plant record
    if (species && genus && family && order) {
      await plant.update({
        species: species,
        genus: genus,
        family: family,
        order: order,
      });
    }

    // Update the upload metadata
    await upload.update({
      species: species || upload.species,
      genus: genus || upload.genus,
      family: family || upload.family,
      order: order || upload.order,
      location: updatedLocation,
      linked: linked || upload.linked,
      not_linked: not_linked || upload.not_linked,
      flagged: flagged || upload.flagged,
    });

    // Send back the updated upload data
    res.status(200).json(upload);
  } catch (error) {
    console.error("Error updating upload:", error);
    res.status(500).json({ error: "Failed to update upload." });
  }
};
