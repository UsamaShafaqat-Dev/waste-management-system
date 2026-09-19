const { Op } = require("sequelize");
const Vehicle = require("../models/Vehicle");
const Route = require("../models/Route"); // Populate ko mimic karne ke liye Route import kiya

// @desc    Create a new vehicle
// @route   POST /api/vehicles
const createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleName, driverName, driverContact, status } =
      req.body;

    // Sequelize mein data dhoondne ke liye 'where' use karte hain
    const vehicleExists = await Vehicle.findOne({ where: { vehicleNumber } });
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
    const rawVehicles = await Vehicle.findAll({ raw: true });

    // Populate "assignedRoute" ko manual tareeqe se set karna
    const routeIds = [
      ...new Set(
        rawVehicles.map((v) => v.assignedRoute).filter((id) => id != null),
      ),
    ];

    const routes = await Route.findAll({
      where: { _id: { [Op.in]: routeIds } },
      attributes: ["_id", "routeName"], // Sirf id aur routeName chahiye
      raw: true,
    });

    const vehicles = rawVehicles.map((v) => {
      const routeObj = routes.find((r) => r._id === v.assignedRoute);
      return {
        ...v,
        assignedRoute: routeObj || null,
      };
    });

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Naya data object mein daal kar save kar diya
    Object.keys(req.body).forEach((key) => {
      vehicle[key] = req.body[key];
    });

    await vehicle.save();

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Sequelize mein delete ke liye destroy()
    await vehicle.destroy();

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createVehicle, getVehicles, updateVehicle, deleteVehicle };
