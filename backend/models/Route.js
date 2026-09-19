const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Route = sequelize.define(
  "Route",
  {
    // Frontend compatibility ke liye _id
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    routeName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Linking Route to a specific Vehicle (Ab MySQL mein ye integer ID hogi)
    assignedVehicle: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
    tableName: "routes",
  },
);

module.exports = Route;
