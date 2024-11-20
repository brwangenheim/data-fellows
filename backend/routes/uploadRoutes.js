const express = require("express");
const uploadController = require("../controllers/uploadController");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "./data/images" });

// Define routes for uploads
router.post("/", upload.single("photo"), (req, res) => {
  console.log("File:", req.file); // This should contain information about the uploaded file
  console.log("Body:", req.body); // Check other form fields
  uploadController.uploadImage(req, res);
});
router.put("/update/:id", uploadController.updateUpload);
router.get("/", uploadController.getAllUploads);
router.get("/all", uploadController.getAllUploadsWithPlantData);
router.delete("/delete/:id", uploadController.deleteUpload);

module.exports = router;

router.get("/:id", uploadController.getUploadById);
// router.get("/:upload_id", uploadController.getPlantAndUploadById);
// router.get("/:plant_id", uploadController.getUploadsByPlantID);
