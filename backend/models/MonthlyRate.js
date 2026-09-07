const mongoose = require("mongoose");

const monthlyRateSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // Format: YYYY-MM
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    rate: { type: Number, required: true },
  },
  { timestamps: true },
);

// Taake ek dukan ka ek mahinay mein sirf ek hi rate save ho
monthlyRateSchema.index({ month: 1, shop: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyRate", monthlyRateSchema);
