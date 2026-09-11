const express = require("express");
const router = express.Router();
const {
  getShopTotalWeight,
  createFactoryWeight,
  getFactoryWeights,
  updateFactoryWeight,
  deleteFactoryWeight, // 🔥 Yeh NAYA function import hona zaroori hai
} = require("../controllers/factoryWeightController");

router.route("/shop-total").get(getShopTotalWeight);
router.route("/").post(createFactoryWeight).get(getFactoryWeights);

// 🔥 NAYA: .delete(deleteFactoryWeight) is line mein aakhir mein add karna zaroori hai
router.route("/:id").put(updateFactoryWeight).delete(deleteFactoryWeight);

module.exports = router;
