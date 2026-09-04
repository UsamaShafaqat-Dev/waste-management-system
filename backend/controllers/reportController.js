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

    // 1. Get Master Counts
    const totalRoutes = await Route.countDocuments({ status: "Active" });
    const totalVehicles = await Vehicle.countDocuments({ status: "Active" });
    const totalShops = await Shop.countDocuments({ status: "Active" });

    // 2. Aggregate Daily Collections (Shop KG and Payable Amount)
    const collections = await DailyCollection.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalShopKg: { $sum: "$weightKg" },
          totalPayableAmount: { $sum: "$amount" },
        },
      },
    ]);

    // 3. Aggregate Factory Weights[cite: 1]
    const factory = await FactoryWeight.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalFactoryKg: { $sum: "$factoryWeight" },
        },
      },
    ]);

    const shopKg = collections.length > 0 ? collections[0].totalShopKg : 0;
    const payableAmount =
      collections.length > 0 ? collections[0].totalPayableAmount : 0;
    const factoryKg = factory.length > 0 ? factory[0].totalFactoryKg : 0;
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
