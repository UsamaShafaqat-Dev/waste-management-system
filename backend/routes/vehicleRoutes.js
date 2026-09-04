const express = require("express");
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

// Standard routes (Create, Read)
router.route("/").post(createVehicle).get(getVehicles);

// Routes with ID (Update, Delete)
router.route("/:id").put(updateVehicle).delete(deleteVehicle);

module.exports = router;
