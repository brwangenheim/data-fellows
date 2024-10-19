// Database schema for plants (if needed for migrations)
const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

// Define the Plant model
const Plant = sequelize.define(
  "Plant",
  {
    plant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    common_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "plants", // Specify the table name in the database
    timestamps: false, // Disable timestamps (createdAt, updatedAt)
  }
);

// Export the Plant model
module.exports = Plant;
