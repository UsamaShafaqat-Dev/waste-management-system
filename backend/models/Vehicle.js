const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Vehicle = sequelize.define(
  "Vehicle",
  {
    // Frontend compatibility ke liye _id
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vehicleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driverContact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Linking Vehicle to a specific Route
    assignedRoute: {
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
    tableName: "vehicles",
  },
);

module.exports = Vehicle;
