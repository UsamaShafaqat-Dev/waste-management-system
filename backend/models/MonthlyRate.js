const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MonthlyRate = sequelize.define(
  "MonthlyRate",
  {
    // Frontend compatibility ke liye ID
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    month: {
      type: DataTypes.STRING, // Format: YYYY-MM
      allowNull: false,
    },
    route: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shop: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "monthly_rates",

    // Taake ek dukan ka ek mahinay mein sirf ek hi rate save ho
    indexes: [
      {
        unique: true,
        fields: ["month", "shop"],
      },
    ],
  },
);

module.exports = MonthlyRate;
