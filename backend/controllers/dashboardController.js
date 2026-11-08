const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const Vehicle = require("../models/Vehicle");
const Route = require("../models/Route");
const Shop = require("../models/Shop");
const DailyCollection = require("../models/DailyCollection");
const FactoryWeight = require("../models/FactoryWeight");

const getDashboardStats = async (req, res) => {
  try {
    const { date, route } = req.query;

    const totalVehicles = await Vehicle.count({ where: { status: "Active" } });
    const totalRoutes = await Route.count({ where: { status: "Active" } });
    const totalShops = await Shop.count({ where: { status: "Active" } });

    const matchQuery = {};
    const factoryMatchQuery = {};

    // 1. DATE FILTER
    if (date && date !== "All" && date !== "undefined" && date !== "") {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      matchQuery.date = { [Op.between]: [startDate, endDate] };
      factoryMatchQuery.date = { [Op.between]: [startDate, endDate] };
    }

    // 2. ROUTE FILTER (MySQL Sequelize uses routeId usually)
    if (route && route !== "All" && route !== "undefined" && route !== "") {
      const parsedRouteId = parseInt(route, 10);
      matchQuery.routeId = parsedRouteId; // Updated from route to routeId
      factoryMatchQuery.routeId = parsedRouteId;
    }

    // 3. Totals
    const totalShopWeight =
      (await DailyCollection.sum("weightKg", { where: matchQuery })) || 0;
    const totalFactoryWeight =
      (await FactoryWeight.sum("factoryWeight", {
        where: factoryMatchQuery,
      })) || 0;
    const totalDifference = totalFactoryWeight - totalShopWeight;

    // 4. Route-wise Breakdown
    const allActiveRoutes = await Route.findAll({
      where: { status: "Active" },
      raw: true,
    });

    let filteredRoutes = allActiveRoutes;
    if (matchQuery.routeId) {
      filteredRoutes = allActiveRoutes.filter(
        (r) => (r.id || r._id) === matchQuery.routeId,
      );
    }

    // Grouping using correct column name 'routeId'
    const shopByRoute = await DailyCollection.findAll({
      attributes: [
        "routeId",
        [sequelize.fn("SUM", sequelize.col("weightKg")), "totalWeight"],
      ],
      where: matchQuery,
      group: ["routeId"],
      raw: true,
    });

    const factoryByRoute = await FactoryWeight.findAll({
      attributes: [
        "routeId",
        [sequelize.fn("SUM", sequelize.col("factoryWeight")), "totalWeight"],
      ],
      where: factoryMatchQuery,
      group: ["routeId"],
      raw: true,
    });

    const routeBreakdown = filteredRoutes.map((r) => {
      const rId = r.id || r._id;
      const sData = shopByRoute.find((s) => s.routeId === rId);
      const fData = factoryByRoute.find((f) => f.routeId === rId);

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

    // 5. Recent Activity
    const recentActivity = await DailyCollection.findAll({
      where: matchQuery,
      order: [["id", "DESC"]],
      limit: 6,
      raw: true,
    });

    const shopIds = [
      ...new Set(recentActivity.map((item) => item.shopId || item.shop)),
    ].filter(Boolean);
    const routeIds = [
      ...new Set(recentActivity.map((item) => item.routeId || item.route)),
    ].filter(Boolean);

    const shops = await Shop.findAll({
      where: { id: { [Op.in]: shopIds } },
      raw: true,
    });
    const routesList = await Route.findAll({
      where: { id: { [Op.in]: routeIds } },
      raw: true,
    });

    const formattedRecentActivity = recentActivity.map((item) => {
      const sId = item.shopId || item.shop;
      const rId = item.routeId || item.route;
      const shop = shops.find((s) => s.id === sId);
      const routeObj = routesList.find((r) => r.id === rId);

      return {
        id: item.id,
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
