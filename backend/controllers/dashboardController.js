const { Op } = require("sequelize");
const { sequelize } = require("../config/db"); // Sequelize instance for functions
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

    // Mongoose ke countDocuments ki jagah Sequelize ka count()
    const totalVehicles = await Vehicle.count({ where: { status: "Active" } });
    const totalRoutes = await Route.count({ where: { status: "Active" } });
    const totalShops = await Shop.count({ where: { status: "Active" } });

    const matchQuery = {};

    // 1. EXACT DATE MATCH LOGIC (Sequelize Op.between)
    if (date && date !== "All" && date !== "undefined" && date !== "") {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      matchQuery.date = { [Op.between]: [startDate, endDate] };
    }

    // 2. ROUTE MATCH LOGIC
    if (route && route !== "All" && route !== "undefined" && route !== "") {
      matchQuery.route = route; // MySQL mein simple integer ID hoti hai
    }

    // 3. Calculate Shop Weight (Sequelize sum function)
    const totalShopWeight =
      (await DailyCollection.sum("weightKg", { where: matchQuery })) || 0;

    // 4. Calculate Factory Weight
    const totalFactoryWeight =
      (await FactoryWeight.sum("factoryWeight", { where: matchQuery })) || 0;

    // 5. Total Difference (Factory Wgt - Shop Wgt)
    const totalDifference = totalFactoryWeight - totalShopWeight;

    // 6. Route-wise Breakdown Logic
    const allActiveRoutes = await Route.findAll({
      where: { status: "Active" },
      raw: true,
    });

    let filteredRoutes = allActiveRoutes;
    if (matchQuery.route) {
      filteredRoutes = allActiveRoutes.filter(
        (r) => r._id.toString() === matchQuery.route.toString(),
      );
    }

    // Group by route for shop weight using Sequelize aggregate
    const shopByRoute = await DailyCollection.findAll({
      attributes: [
        "route",
        [sequelize.fn("SUM", sequelize.col("weightKg")), "totalWeight"],
      ],
      where: matchQuery,
      group: ["route"],
      raw: true,
    });

    // Group by route for factory weight using Sequelize aggregate
    const factoryByRoute = await FactoryWeight.findAll({
      attributes: [
        "route",
        [sequelize.fn("SUM", sequelize.col("factoryWeight")), "totalWeight"],
      ],
      where: matchQuery,
      group: ["route"],
      raw: true,
    });

    const routeBreakdown = filteredRoutes.map((r) => {
      const rId = r._id.toString();

      const sData = shopByRoute.find((s) => s.route.toString() === rId);
      const fData = factoryByRoute.find((f) => f.route.toString() === rId);

      // Sequelize grouped sums string bhi return kar dete hain kabhi kabhi, is liye parseFloat lagaya hai
      const sWgt =
        sData && sData.totalWeight ? parseFloat(sData.totalWeight) : 0;
      const fWgt =
        fData && fData.totalWeight ? parseFloat(fData.totalWeight) : 0;

      return {
        routeName: r.routeName,
        shopWeight: sWgt,
        factoryWeight: fWgt,
        difference: fWgt - sWgt,
      };
    });

    // 🔥 NAYA: Recent Activity (Latest 6 Collections)
    const recentActivity = await DailyCollection.findAll({
      where: matchQuery,
      order: [["_id", "DESC"]], // Latest pehle
      limit: 6,
      raw: true,
    });

    // Manual populate (Associations ke errors se bachne ke liye safe tareeqa)
    const shopIds = [...new Set(recentActivity.map((item) => item.shop))];
    const routeIds = [...new Set(recentActivity.map((item) => item.route))];

    const shops = await Shop.findAll({
      where: { _id: { [Op.in]: shopIds } },
      raw: true,
    });
    const routesList = await Route.findAll({
      where: { _id: { [Op.in]: routeIds } },
      raw: true,
    });

    const formattedRecentActivity = recentActivity.map((item) => {
      const shop = shops.find((s) => s._id === item.shop);
      const routeObj = routesList.find((r) => r._id === item.route);

      return {
        id: item._id,
        shopName: shop ? shop.shopName : "Unknown Shop",
        routeName: routeObj ? routeObj.routeName : "Unknown Route",
        weightKg: item.weightKg,
        date: item.date,
      };
    });

    res.status(200).json({
      totalVehicles,
      totalRoutes,
      totalShops,
      totalShopWeight,
      totalFactoryWeight,
      totalDifference,
      routeBreakdown,
      recentActivity: formattedRecentActivity,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
