const Vehicle = require("../models/Vehicle");

// @desc    Create a new vehicle
// @route   POST /api/vehicles
const createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleName, driverName, driverContact, status } =
      req.body;

    const vehicleExists = await Vehicle.findOne({ vehicleNumber });
    if (vehicleExists) {
      return res
        .status(400)
        .json({ message: "Vehicle with this number already exists" });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      vehicleName,
      driverName,
      driverContact,
      status,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate(
      "assignedRoute",
      "routeName",
    );
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the updated document
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createVehicle, getVehicles, updateVehicle, deleteVehicle };
