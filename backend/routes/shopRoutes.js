const express = require("express");
const router = express.Router();
const {
  createShop,
  getShops,
  updateShop,
  deleteShop,
  fixSerialNumbers,
} = require("../controllers/shopController");

router.route("/").post(createShop).get(getShops);

// 🔥 NAYA: Purane serial numbers ko ek click mein fix karne ka route
router.get("/fix-serials", fixSerialNumbers);

router.route("/:id").put(updateShop).delete(deleteShop);

module.exports = router;
