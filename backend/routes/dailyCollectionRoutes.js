const express = require("express");
const router = express.Router();
const {
  createDailyCollection,
  getShopsByRoute,
  updateCollectionWeight, // 🔥 NAYA: Import kiya gaya function
} = require("../controllers/dailyCollectionController");

router.route("/").post(createDailyCollection);

router.route("/shops/:routeId").get(getShopsByRoute);

// 🔥 NAYA: Ghalti theek karne wala (Update Weight) route
router.route("/:id").put(updateCollectionWeight);

module.exports = router;
