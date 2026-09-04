const express = require("express");
const router = express.Router();
const {
  getShopTotalWeight,
  createFactoryWeight,
} = require("../controllers/factoryWeightController");

router.route("/shop-total").get(getShopTotalWeight);
router.route("/").post(createFactoryWeight);

module.exports = router;
