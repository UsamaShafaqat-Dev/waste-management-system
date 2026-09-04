const mongoose = require("mongoose");

const dailyCollectionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
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
    weightKg: {
      type: Number,
      required: true,
    },
    ratePerKg: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Collected",
    },
  },
  {
    timestamps: true,
  },
);

// VIP Feature: Prevent double entry for the same shop on the exact same date
dailyCollectionSchema.index({ date: 1, shop: 1 }, { unique: true });

module.exports = mongoose.model("DailyCollection", dailyCollectionSchema);
