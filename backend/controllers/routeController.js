const { Op } = require("sequelize");
const Route = require("../models/Route");
const Vehicle = require("../models/Vehicle");

// @desc    Create a new route
const createRoute = async (req, res) => {
  try {
    const { routeName, assignedVehicle, status } = req.body;

    // Sequelize mein search ke liye 'where' use hota hai
    const routeExists = await Route.findOne({ where: { routeName } });
    if (routeExists) {
      return res
        .status(400)
        .json({ message: "Route with this name already exists" });
    }

    const route = await Route.create({
      routeName,
      assignedVehicle: assignedVehicle || null,
      status,
    });

    if (assignedVehicle) {
      // Mongoose ke findByIdAndUpdate ki jagah Sequelize ka update method
      await Vehicle.update(
        { assignedRoute: route._id },
        { where: { _id: assignedVehicle } },
      );
    }

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all routes
const getRoutes = async (req, res) => {
  try {
    const rawRoutes = await Route.findAll({ raw: true });

    // Populate ko mimic karne ke liye assignedVehicles ki IDs nikal kar fetch kar rahe hain
    const vehicleIds = [
      ...new Set(
        rawRoutes.map((r) => r.assignedVehicle).filter((id) => id != null),
      ),
    ];

    const vehicles = await Vehicle.findAll({
      where: { _id: { [Op.in]: vehicleIds } },
      attributes: ["_id", "vehicleNumber", "driverName"], // Sirf zaroori fields
      raw: true,
    });

    const routes = rawRoutes.map((route) => {
      const vehicle = vehicles.find((v) => v._id === route.assignedVehicle);
      return {
        ...route,
        assignedVehicle: vehicle || null,
      };
    });

    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Dynamic update (jo fields aayin hain sirf unko update karo)
    Object.keys(req.body).forEach((key) => {
      route[key] = req.body[key];
    });
    await route.save();

    // Update vehicle's route reference if a new vehicle is assigned
    if (req.body.assignedVehicle) {
      await Vehicle.update(
        { assignedRoute: route._id },
        { where: { _id: req.body.assignedVehicle } },
      );
    }

    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Remove route reference from the vehicle
    if (route.assignedVehicle) {
      await Vehicle.update(
        { assignedRoute: null },
        { where: { _id: route.assignedVehicle } },
      );
    }

    // Sequelize mein delete ke liye destroy use hota hai
    await route.destroy();

    res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoute, getRoutes, updateRoute, deleteRoute };
