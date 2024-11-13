const express = require("express");
const uploadController = require("../controllers/uploadController");
const router = express.Router();

// Define routes for uploads
router.post("/", uploadController.uploadImage);
router.get("/", uploadController.getAllUploads);
// router.get("/:id", uploadController.getUploadById);
// router.delete("/:id", uploadController.deleteUpload);
// router.get("/:upload_id", uploadController.getPlantAndUploadById);
// router.get("/:plant_id", uploadController.getUploadsByPlantID);
router.get("/all", uploadController.getAllUploadsWithPlantData);

module.exports = router;
