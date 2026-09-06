const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Debit", "Credit"],
      default: "Debit", // Default debit hi rahega
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Check", "Bank Transfer", "Other"],
      default: "Cash",
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

module.exports = mongoose.model("Payment", paymentSchema);
