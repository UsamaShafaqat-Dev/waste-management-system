const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");

// @desc    Save daily collection for a route
// @route   POST /api/daily-collections
const createDailyCollection = async (req, res) => {
  try {
    const { date, routeId, vehicleId, collections } = req.body;

    // Set time to start of the day for consistent checking
    const collectionDate = new Date(date);
    collectionDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Double Entry Check
    const existingEntry = await DailyCollection.findOne({
      route: routeId,
      date: { $gte: collectionDate, $lte: endOfDay },
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "Collection for this Route on this Date is already submitted!",
      });
    }

    const formattedData = collections.map((item) => ({
      date: collectionDate,
      route: routeId,
      vehicle: vehicleId,
      shop: item.shopId,
      weightKg: item.weightKg || 0,
      ratePerKg: 0,
      amount: 0,
    }));

    await DailyCollection.insertMany(formattedData);

    res.status(201).json({ message: "Daily Collection Saved Successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
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

// 🔥 NAYA: Ghalti theek karne wala (Update Weight) API
// @desc    Update a specific daily collection weight
// @route   PUT /api/daily-collections/:id
const updateCollectionWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { weightKg } = req.body;

    const collection = await DailyCollection.findByIdAndUpdate(
      id,
      { weightKg: parseFloat(weightKg) || 0 },
      { new: true },
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection record not found" });
    }

    res
      .status(200)
      .json({ message: "Weight updated successfully", collection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDailyCollection,
  getShopsByRoute,
  updateCollectionWeight,
};
