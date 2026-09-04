const express = require("express");
const router = express.Router();
const {
  createDailyCollection,
  getShopsByRoute,
} = require("../controllers/dailyCollectionController");

router.route("/").post(createDailyCollection);

router.route("/shops/:routeId").get(getShopsByRoute);

module.exports = router;
