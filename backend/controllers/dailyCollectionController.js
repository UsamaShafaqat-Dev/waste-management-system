const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");

// @desc    Save daily collection for a route
// @route   POST /api/daily-collections
const createDailyCollection = async (req, res) => {
  try {
    const { date, routeId, vehicleId, collections } = req.body;
    // collections will be an array of objects: [{ shopId, weightKg, ratePerKg, amount }]

    // Set time to start of the day for consistent checking
    const collectionDate = new Date(date);
    collectionDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Double Entry Check: Check if collection already exists for this route on this date
    const existingEntry = await DailyCollection.findOne({
      route: routeId,
      date: { $gte: collectionDate, $lte: endOfDay },
    });

    if (existingEntry) {
      return res
        .status(400)
        .json({
          message:
            "Collection for this Route on this Date is already submitted!",
        });
    }

    // Format data for database insertion
    const formattedData = collections.map((item) => ({
      date: collectionDate,
      route: routeId,
      vehicle: vehicleId,
      shop: item.shopId,
      weightKg: item.weightKg,
      ratePerKg: item.ratePerKg,
      amount: item.amount,
    }));

    // Bulk save all shop records at once
    await DailyCollection.insertMany(formattedData);

    res.status(201).json({ message: "Daily Collection Saved Successfully!" });
  } catch (error) {
    // Catch MongoDB duplicate key error (Double Entry Fallback)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message:
            "Double Entry Detected: A shop in this route already has data for this date.",
        });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shops by route ID for the form dropdowns
// @route   GET /api/daily-collections/shops/:routeId
const getShopsByRoute = async (req, res) => {
  try {
    const shops = await Shop.find({
      assignedRoute: req.params.routeId,
      status: "Active",
    });
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDailyCollection, getShopsByRoute };
