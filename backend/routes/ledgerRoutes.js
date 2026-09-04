const express = require("express");
const router = express.Router();
const {
  addPayment,
  getShopLedger,
} = require("../controllers/ledgerController");

router.route("/payments").post(addPayment);
router.route("/shop/:shopId").get(getShopLedger);

module.exports = router;
