const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Shop = sequelize.define(
  "Shop",
  {
    // Frontend compatibility ke liye _id
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedRoute: {
      type: DataTypes.INTEGER, // mongoose.Schema.Types.ObjectId ab Integer ban jayega
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 🔥 Serial Number Field
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
    tableName: "shops",
  },
);

module.exports = Shop;
