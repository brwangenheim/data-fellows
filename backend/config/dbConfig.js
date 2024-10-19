const { Sequelize } = require("sequelize");
const path = require("path");

// Create a new instance of Sequelize connected to SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../data/example_plant_data.db"), // Path to your SQLite database
  logging: false, // Disables SQL logging in the console
});

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
