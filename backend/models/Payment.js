const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define(
  "Payment",
  {
    // Frontend ki compatibility ke liye _id rakha hai
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shop: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentType: {
      type: DataTypes.ENUM("Debit", "Credit"),
      defaultValue: "Debit", // Default debit hi rahega
    },
    paymentMethod: {
      type: DataTypes.ENUM("Cash", "Check", "Bank Transfer", "Other"),
      defaultValue: "Cash",
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "payments",
  },
);

module.exports = Payment;
