const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "A shop must be assigned to a route"],
    },
    serialNumber: {
      type: Number,
      default: 0, // 🔥 NAYA: Serial Number Field
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Shop", shopSchema);
