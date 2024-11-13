const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

// Define the Upload model
const Upload = sequelize.define(
  "Upload",
  {
    upload_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "uploads",
    timestamps: false,
  }
);

Upload.associate = (models) => {
  // Define a relationship where each upload has one plant
  Upload.belongsTo(models.Plant, {
    foreignKey: "plant_id", // This is the foreign key in the 'uploads' table
    as: "plant", // Alias for the association
  });
};

module.exports = Upload;
