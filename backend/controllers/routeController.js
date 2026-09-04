const Route = require("../models/Route");
const Vehicle = require("../models/Vehicle");

// @desc    Create a new route
const createRoute = async (req, res) => {
  try {
    const { routeName, assignedVehicle, status } = req.body;
    const routeExists = await Route.findOne({ routeName });
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
      await Vehicle.findByIdAndUpdate(assignedVehicle, {
        assignedRoute: route._id,
      });
    }

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all routes
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate(
      "assignedVehicle",
      "vehicleNumber driverName",
    );
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Update vehicle's route reference if a new vehicle is assigned
    if (req.body.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(req.body.assignedVehicle, {
        assignedRoute: route._id,
      });
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
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Remove route reference from the vehicle
    if (route.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(route.assignedVehicle, {
        assignedRoute: null,
      });
    }

    res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoute, getRoutes, updateRoute, deleteRoute };
