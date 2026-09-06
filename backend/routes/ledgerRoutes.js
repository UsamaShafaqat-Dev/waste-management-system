const express = require("express");
const router = express.Router();
const {
  addPayment,
  getShopLedger,
  editPayment, // Edit wala function
} = require("../controllers/ledgerController");

// Add new payment
router.route("/payments").post(addPayment);

// Edit existing payment (id ke zariye)
router.route("/payments/:id").put(editPayment);

// Get shop ledger
router.route("/shop/:shopId").get(getShopLedger);

module.exports = router;
