const FactoryWeight = require("../models/FactoryWeight");
const DailyCollection = require("../models/DailyCollection");
const Route = require("../models/Route");

// @desc    Get total shop weight for a specific route and date
// @route   GET /api/factory-weights/shop-total?date=YYYY-MM-DD&routeId=XYZ
const getShopTotalWeight = async (req, res) => {
  try {
    const { date, routeId } = req.query;
    if (!date || !routeId)
      return res
        .status(400)
        .json({ message: "Date and Route ID are required" });

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const collections = await DailyCollection.find({
      route: routeId,
      date: { $gte: queryDate, $lte: endOfDay },
    }).populate("vehicle");

    if (collections.length === 0) {
      return res.status(404).json({
        message:
          "No shop collection found for this route on the selected date.",
      });
    }

    const totalShopWeight = collections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );
    const vehicle = collections[0].vehicle;

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

    const existingEntry = await FactoryWeight.findOne({
      route,
      date: { $gte: entryDate, $lte: endOfDay },
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "Factory weight for this Route and Date is already entered!",
      });
    }

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
      return res.status(400).json({
        message:
          "Double Entry Detected: Factory weight already saved for this date/route.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Factory Weights (History / Monthly Report)
// @route   GET /api/factory-weights
const getFactoryWeights = async (req, res) => {
  try {
    const { month, date, routeId } = req.query;
    let matchQuery = {};

    if (routeId) {
      matchQuery.route = routeId;
    }

    if (date) {
      const queryDate = new Date(date);
      matchQuery.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lte: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    } else if (month) {
      const [year, m] = month.split("-");
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59, 999);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    const history = await FactoryWeight.find(matchQuery)
      .populate("route", "routeName")
      .populate("vehicle", "vehicleNumber driverName")
      .sort({ date: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Factory Weight
// @route   PUT /api/factory-weights/:id
const updateFactoryWeight = async (req, res) => {
  try {
    const { factoryWeight, notes } = req.body;
    const record = await FactoryWeight.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    record.factoryWeight = factoryWeight;
    record.notes = notes;
    record.difference = factoryWeight - record.totalShopWeight;

    if (record.difference > 0) record.status = "Extra";
    else if (record.difference < 0) record.status = "Shortage";
    else record.status = "Balanced";

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 NAYA: Delete Factory Weight function
// @desc    Delete Factory Weight
// @route   DELETE /api/factory-weights/:id
const deleteFactoryWeight = async (req, res) => {
  try {
    const record = await FactoryWeight.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShopTotalWeight,
  createFactoryWeight,
  getFactoryWeights,
  updateFactoryWeight,
  deleteFactoryWeight, // 👈 Export mein zaroor likhna hai
};
