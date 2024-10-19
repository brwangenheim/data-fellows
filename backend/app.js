const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 3000;

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
