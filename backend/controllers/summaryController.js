const DailyCollection = require("../models/DailyCollection");
const FactoryWeight = require("../models/FactoryWeight");
const Payment = require("../models/Payment");
const Shop = require("../models/Shop");
const Route = require("../models/Route");
const MonthlyRate = require("../models/MonthlyRate");

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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Format YYYY-MM for MonthlyRate matching
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    const routeInfo = await Route.findById(routeId).populate("assignedVehicle");
    if (!routeInfo) return res.status(404).json({ message: "Route not found" });

    // 🔥 NAYA: Shops ko serialNumber ke hisab se sort kar ke mangwaya
    const shops = await Shop.find({
      assignedRoute: routeId,
      status: "Active",
    }).sort({ serialNumber: 1 });
    const shopIds = shops.map((s) => s._id);

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

    const monthlyRates = await MonthlyRate.find({
      route: routeId,
      month: monthStr,
    });

    let totalShopKg = 0;
    let totalFactoryKg = 0;
    let totalAmount = 0;
    let totalPaid = 0;

    factoryWeights.forEach((fw) => {
      totalFactoryKg += fw.factoryWeight;
    });

    // Shop breakdown calculations
    const shopBreakdown = shops.map((shop) => {
      const shopCollections = collections.filter(
        (c) => c.shop.toString() === shop._id.toString(),
      );
      const shopPayments = payments.filter(
        (p) => p.shop.toString() === shop._id.toString(),
      );

      // 🔥 NAYA: Rate nikalne ka behtareen tareeqa
      const shopRateObj = monthlyRates.find(
        (r) => r.shop.toString() === shop._id.toString(),
      );
      let shopRate = shopRateObj ? shopRateObj.rate : 0;

      // Agar monthly rate 0 hai, toh backup ke tor par purana rate utha lay (taake 0 show na ho)
      const displayRate = shopRate > 0 ? shopRate : shop.ratePerKg || 0;

      const kg = shopCollections.reduce((sum, c) => sum + c.weightKg, 0);

      let wasteBill = kg * shopRate;
      // Agar naye system se bill 0 ban raha hai, toh purane records ka bill use karein
      if (wasteBill === 0) {
        wasteBill = shopCollections.reduce(
          (sum, c) => sum + (c.amount || 0),
          0,
        );
      }

      const creditPayments = shopPayments
        .filter((p) => p.paymentType === "Credit")
        .reduce((sum, p) => sum + p.amount, 0);
      const credit = wasteBill + creditPayments;

      const debit = shopPayments
        .filter((p) => p.paymentType !== "Credit")
        .reduce((sum, p) => sum + p.amount, 0);
      const remaining = credit - debit;

      totalShopKg += kg;
      totalAmount += credit;
      totalPaid += debit;

      return {
        shopId: shop._id,
        serialNumber: shop.serialNumber, // 🔥 NAYA: Serial Number Bhej diya
        shopName: shop.shopName,
        rate: displayRate, // 🔥 NAYA: Rate bhej diya jo Frontend par show hoga
        kg,
        credit,
        debit,
        remaining,
      };
    });

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
