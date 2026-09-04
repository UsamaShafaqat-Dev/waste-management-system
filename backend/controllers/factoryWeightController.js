const FactoryWeight = require("../models/FactoryWeight");
const DailyCollection = require("../models/DailyCollection");
const Route = require("../models/Route");

// @desc    Get total shop weight for a specific route and date
// @route   GET /api/factory-weights/shop-total?date=YYYY-MM-DD&routeId=XYZ
const getShopTotalWeight = async (req, res) => {
  try {
    const { date, routeId } = req.query;

    if (!date || !routeId) {
      return res
        .status(400)
        .json({ message: "Date and Route ID are required" });
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all shop collections for this route on this date
    const collections = await DailyCollection.find({
      route: routeId,
      date: { $gte: queryDate, $lte: endOfDay },
    }).populate("vehicle");

    if (collections.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No shop collection found for this route on the selected date.",
        });
    }

    // Calculate total weight
    const totalShopWeight = collections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );
    const vehicle = collections[0].vehicle; // Extract assigned vehicle from collection

    res.status(200).json({ totalShopWeight, vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new factory weight entry
// @route   POST /api/factory-weights
const createFactoryWeight = async (req, res) => {
  try {
    const { date, route, vehicle, totalShopWeight, factoryWeight, notes } =
      req.body;

    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for double entry
    const existingEntry = await FactoryWeight.findOne({
      route,
      date: { $gte: entryDate, $lte: endOfDay },
    });

    if (existingEntry) {
      return res
        .status(400)
        .json({
          message: "Factory weight for this Route and Date is already entered!",
        });
    }

    // Auto Calculate Difference and Status[cite: 1]
    const difference = factoryWeight - totalShopWeight;
    let status = "Balanced";
    if (difference > 0) status = "Extra";
    if (difference < 0) status = "Shortage";

    const newFactoryWeight = await FactoryWeight.create({
      date: entryDate,
      route,
      vehicle,
      totalShopWeight,
      factoryWeight,
      difference,
      status,
      notes,
    });

    res.status(201).json(newFactoryWeight);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message:
            "Double Entry Detected: Factory weight already saved for this date/route.",
        });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShopTotalWeight, createFactoryWeight };
