const express = require("express");
const router = express.Router();
const { getRouteMonthlySummary } = require("../controllers/summaryController");

router.route("/route-ledger").get(getRouteMonthlySummary);

module.exports = router;
