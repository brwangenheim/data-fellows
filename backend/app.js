const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");

const port = 5500;

const cors = require("cors");
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500", // Allow both origins
    ],
    methods: ["GET"],
  })
);

app.use("/images", express.static(path.join(__dirname, "data/images")));

// Import routes
const uploadRoutes = require("./routes/uploadRoutes");
const plantRoutes = require("./routes/plantRoutes");
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(bodyParser.json());
app.use("/uploads", uploadRoutes);
app.use("/plants", plantRoutes);
app.use("/users", userRoutes);

// Error handling (optional)
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
