const Vehicle = require("../models/Vehicle");
const Route = require("../models/Route");
const Shop = require("../models/Shop");
const DailyCollection = require("../models/DailyCollection");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ status: "Active" });
    const totalRoutes = await Route.countDocuments({ status: "Active" });
    const totalShops = await Shop.countDocuments({ status: "Active" });

    // Today's collection calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysCollections = await DailyCollection.aggregate([
      { $match: { date: { $gte: today, $lte: endOfDay } } },
      {
        $group: {
          _id: null,
          totalWeight: { $sum: "$weightKg" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const todayWeight =
      todaysCollections.length > 0 ? todaysCollections[0].totalWeight : 0;
    const todayAmount =
      todaysCollections.length > 0 ? todaysCollections[0].totalAmount : 0;

    res.status(200).json({
      totalVehicles,
      totalRoutes,
      totalShops,
      todayWeight,
      todayAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
