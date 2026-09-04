const express = require("express");
const router = express.Router();
const { getMonthlyBusinessReport } = require("../controllers/reportController");

router.route("/monthly").get(getMonthlyBusinessReport);

module.exports = router;
