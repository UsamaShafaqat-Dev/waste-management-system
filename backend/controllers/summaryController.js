const DailyCollection = require("../models/DailyCollection");
const FactoryWeight = require("../models/FactoryWeight");
const Payment = require("../models/Payment");
const Shop = require("../models/Shop");
const Route = require("../models/Route");

// @desc    Get Route-Wise Monthly Ledger Summary
// @route   GET /api/summary/route-ledger?routeId=XYZ&month=8&year=2026
const getRouteMonthlySummary = async (req, res) => {
  try {
    const { routeId, month, year } = req.query;

    if (!routeId || !month || !year) {
      return res
        .status(400)
        .json({ message: "Route, Month, and Year are required" });
    }

    // Set date boundaries for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Get Route and Vehicle Info[cite: 1]
    const routeInfo = await Route.findById(routeId).populate("assignedVehicle");
    if (!routeInfo) return res.status(404).json({ message: "Route not found" });

    // 2. Get all shops for this route[cite: 1]
    const shops = await Shop.find({ assignedRoute: routeId, status: "Active" });
    const shopIds = shops.map((s) => s._id);

    // 3. Fetch data for the selected month[cite: 1]
    const collections = await DailyCollection.find({
      route: routeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const factoryWeights = await FactoryWeight.find({
      route: routeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const payments = await Payment.find({
      shop: { $in: shopIds },
      date: { $gte: startDate, $lte: endDate },
    });

    // 4. Aggregate Data[cite: 1]
    let totalShopKg = 0;
    let totalFactoryKg = 0;
    let totalAmount = 0; // Credit
    let totalPaid = 0; // Debit

    // Calculate Total Factory KG
    factoryWeights.forEach((fw) => {
      totalFactoryKg += fw.factoryWeight;
    });

    // Shop breakdown calculations[cite: 1]
    const shopBreakdown = shops.map((shop) => {
      const shopCollections = collections.filter(
        (c) => c.shop.toString() === shop._id.toString(),
      );
      const shopPayments = payments.filter(
        (p) => p.shop.toString() === shop._id.toString(),
      );

      const kg = shopCollections.reduce((sum, c) => sum + c.weightKg, 0);
      const credit = shopCollections.reduce((sum, c) => sum + c.amount, 0);
      const debit = shopPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = credit - debit;

      totalShopKg += kg;
      totalAmount += credit;
      totalPaid += debit;

      return {
        shopId: shop._id,
        shopName: shop.shopName,
        rate: shop.ratePerKg,
        kg,
        credit,
        debit,
        remaining,
      };
    });

    // 5. Send Response
    res.status(200).json({
      routeInfo: {
        routeName: routeInfo.routeName,
        vehicle: routeInfo.assignedVehicle
          ? routeInfo.assignedVehicle.vehicleNumber
          : "N/A",
        driver: routeInfo.assignedVehicle
          ? routeInfo.assignedVehicle.driverName
          : "N/A",
        totalShops: shops.length,
      },
      summary: {
        totalShopKg,
        totalFactoryKg,
        totalDifference: totalFactoryKg - totalShopKg,
        totalAmount,
        totalPaid,
        totalRemaining: totalAmount - totalPaid,
      },
      shopBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRouteMonthlySummary };
