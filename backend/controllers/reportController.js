const { Op } = require("sequelize");
const DailyCollection = require("../models/DailyCollection");
const FactoryWeight = require("../models/FactoryWeight");
const Route = require("../models/Route");
const Vehicle = require("../models/Vehicle");
const Shop = require("../models/Shop");

// @desc    Get Monthly Business Report
// @route   GET /api/reports/monthly?month=8&year=2026
const getMonthlyBusinessReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year)
      return res.status(400).json({ message: "Month and Year are required" });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchQuery = {
      date: { [Op.between]: [startDate, endDate] },
    };

    // 1. Get Master Counts (Mongoose countDocuments ki jagah Sequelize count)
    const totalRoutes = await Route.count({ where: { status: "Active" } });
    const totalVehicles = await Vehicle.count({ where: { status: "Active" } });
    const totalShops = await Shop.count({ where: { status: "Active" } });

    // 2. Aggregate Daily Collections (Sequelize ka sum function)
    const shopKg =
      (await DailyCollection.sum("weightKg", { where: matchQuery })) || 0;
    const payableAmount =
      (await DailyCollection.sum("amount", { where: matchQuery })) || 0;

    // 3. Aggregate Factory Weights
    const factoryKg =
      (await FactoryWeight.sum("factoryWeight", { where: matchQuery })) || 0;

    const difference = factoryKg - shopKg;

    res.status(200).json({
      masterData: { totalRoutes, totalVehicles, totalShops },
      report: {
        totalShopKg: shopKg,
        totalFactoryKg: factoryKg,
        totalDifference: difference,
        totalPayableAmount: payableAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyBusinessReport };
