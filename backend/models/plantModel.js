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
    family: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "plants",
    timestamps: false,
  }
);

Plant.associate = (models) => {
  // Define the reverse relationship where a plant has many uploads
  Plant.hasMany(models.Upload, {
    foreignKey: "plant_id", // This is the foreign key in the 'uploads' table
    as: "uploads", // Alias for the association
  });
};

// Export the Plant model
module.exports = Plant;
