const express = require("express");
const router = express.Router();
const {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");

router.route("/").post(createRoute).get(getRoutes);

router.route("/:id").put(updateRoute).delete(deleteRoute);

module.exports = router;
