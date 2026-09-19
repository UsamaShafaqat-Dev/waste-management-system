const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Aapki database connection file

const DailyCollection = sequelize.define(
  "DailyCollection",
  {
    // MySQL mein ID numbers mein hoti hai, is liye Auto Increment lagaya hai
    // par naam '_id' hi rakha hai taake frontend kharab na ho
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    shop: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vehicle: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weightKg: {
      type: DataTypes.FLOAT, // Wazan points mein bhi ho sakta hai is liye FLOAT
      allowNull: false,
    },
    ratePerKg: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Collected",
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt khud ban jayenge
    tableName: "daily_collections",

    // VIP Feature: Prevent double entry for the same shop on the exact same date
    indexes: [
      {
        unique: true,
        fields: ["date", "shop"],
      },
    ],
  },
);

module.exports = DailyCollection;
