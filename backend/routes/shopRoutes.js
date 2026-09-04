const express = require("express");
const router = express.Router();
const {
  createShop,
  getShops,
  updateShop,
  deleteShop,
} = require("../controllers/shopController");

router.route("/").post(createShop).get(getShops);

router.route("/:id").put(updateShop).delete(deleteShop);

module.exports = router;
