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
    paymentMethod: {
      type: String,
      enum: ["Cash", "Check", "Bank Transfer", "Other"],
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
    },
    // To identify user who entered the payment (Staff/Admin)
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ye hum auth lagane ke baad link kar lenge
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
