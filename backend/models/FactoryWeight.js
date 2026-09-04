const mongoose = require("mongoose");

const factoryWeightSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    totalShopWeight: {
      type: Number,
      required: true,
    },
    factoryWeight: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Extra", "Shortage", "Balanced"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// VIP Feature: Ek date aur ek route ki factory entry sirf ek baar ho sakti hai
factoryWeightSchema.index({ date: 1, route: 1 }, { unique: true });

module.exports = mongoose.model("FactoryWeight", factoryWeightSchema);
