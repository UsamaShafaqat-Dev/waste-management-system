const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Route = require("../models/Route");
const Shop = require("../models/Shop");
const DailyCollection = require("../models/DailyCollection");
const FactoryWeight = require("../models/FactoryWeight");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const { date, route } = req.query;

    const totalVehicles = await Vehicle.countDocuments({ status: "Active" });
    const totalRoutes = await Route.countDocuments({ status: "Active" });
    const totalShops = await Shop.countDocuments({ status: "Active" });

    const matchQuery = {};

    // 1. EXACT DATE MATCH LOGIC
    if (date && date !== "All" && date !== "undefined" && date !== "") {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    // 2. ROUTE MATCH LOGIC
    if (route && route !== "All" && route !== "undefined" && route !== "") {
      if (mongoose.Types.ObjectId.isValid(route)) {
        matchQuery.route = new mongoose.Types.ObjectId(route);
      }
    }

    // 3. Calculate Shop Weight
    const shopCollections = await DailyCollection.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalWeight: { $sum: "$weightKg" } } },
    ]);
    const totalShopWeight =
      shopCollections.length > 0 ? shopCollections[0].totalWeight : 0;

    // 4. Calculate Factory Weight
    const factoryCollections = await FactoryWeight.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalWeight: { $sum: "$factoryWeight" } } },
    ]);
    const totalFactoryWeight =
      factoryCollections.length > 0 ? factoryCollections[0].totalWeight : 0;

    // 5. Total Difference (Factory Wgt - Shop Wgt)
    const totalDifference = totalFactoryWeight - totalShopWeight;

    // 🔥 NAYA: Route-wise Breakdown Logic (Client ki demand)
    const allActiveRoutes = await Route.find({ status: "Active" });

    // Agar koi specific route select kiya hai toh sirf usay dikhayen, warna sab ko.
    let filteredRoutes = allActiveRoutes;
    if (matchQuery.route) {
      filteredRoutes = allActiveRoutes.filter(
        (r) => r._id.toString() === matchQuery.route.toString(),
      );
    }

    // Shop weight route wise nikalo
    const shopByRoute = await DailyCollection.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$route", totalWeight: { $sum: "$weightKg" } } },
    ]);

    // Factory weight route wise nikalo
    const factoryByRoute = await FactoryWeight.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$route", totalWeight: { $sum: "$factoryWeight" } } },
    ]);

    // Dono ko aapas mein map kar ke table ka data bana lo
    const routeBreakdown = filteredRoutes.map((r) => {
      const rId = r._id.toString();
      const sWgt =
        shopByRoute.find((s) => s._id && s._id.toString() === rId)
          ?.totalWeight || 0;
      const fWgt =
        factoryByRoute.find((f) => f._id && f._id.toString() === rId)
          ?.totalWeight || 0;
      return {
        routeName: r.routeName,
        shopWeight: sWgt,
        factoryWeight: fWgt,
        difference: fWgt - sWgt, // Shortage/Extra diff
      };
    });

    res.status(200).json({
      totalVehicles,
      totalRoutes,
      totalShops,
      totalShopWeight,
      totalFactoryWeight,
      totalDifference,
      routeBreakdown, // 🔥 NAYA array frontend ke liye
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
