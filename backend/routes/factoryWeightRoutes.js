const express = require("express");
const router = express.Router();
const {
  getShopTotalWeight,
  createFactoryWeight,
  getFactoryWeights, // Naya history mangwane wala function
  updateFactoryWeight, // Naya update karne wala function
} = require("../controllers/factoryWeightController");

// Get total shop weight for a specific route & date
router.route("/shop-total").get(getShopTotalWeight);

// Create new factory weight AND Get all history (Monthly Report)
router.route("/").post(createFactoryWeight).get(getFactoryWeights);

// Update existing factory weight (Admin Edit)
router.route("/:id").put(updateFactoryWeight);

module.exports = router;
