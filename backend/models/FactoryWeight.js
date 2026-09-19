const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Aapki database connection file

const FactoryWeight = sequelize.define(
  "FactoryWeight",
  {
    // Frontend compatibility ke liye ID ka naam '_id' hi rakha hai
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    route: {
      type: DataTypes.INTEGER, // MySQL mein ref ID integer hoti hai
      allowNull: false,
    },
    vehicle: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalShopWeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    factoryWeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    difference: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Extra", "Shortage", "Balanced"), // Enum bilkul Mongoose jaisa kaam karega
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "factory_weights",

    // VIP Feature: Ek date aur ek route ki factory entry sirf ek baar ho sakti hai
    indexes: [
      {
        unique: true,
        fields: ["date", "route"],
      },
    ],
  },
);

module.exports = FactoryWeight;
