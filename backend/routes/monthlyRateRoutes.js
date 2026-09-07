const express = require("express");
const router = express.Router();
const {
  getMonthlyRates,
  saveMonthlyRates,
} = require("../controllers/monthlyRateController");

router.get("/", getMonthlyRates);
router.post("/", saveMonthlyRates);

module.exports = router;
