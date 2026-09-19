const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");
const { Op } = require("sequelize"); // Sequelize operators lazmi hain queries ke liye

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

    // Double Entry Check (Sequelize format)
    const existingEntry = await DailyCollection.findOne({
      where: {
        route: routeId,
        date: {
          [Op.between]: [collectionDate, endOfDay],
        },
      },
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

    // Sequelize mein bulk insert ke liye bulkCreate use hota hai
    await DailyCollection.bulkCreate(formattedData);

    res.status(201).json({ message: "Daily Collection Saved Successfully!" });
  } catch (error) {
    // MySQL (Sequelize) ka unique index error pakarne ka tareeqa
    if (error.name === "SequelizeUniqueConstraintError") {
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
    // Mongoose ke find() ki jagah findAll() aur where lagana parta hai
    const shops = await Shop.findAll({
      where: {
        assignedRoute: req.params.routeId,
        status: "Active",
      },
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

    // Sequelize mein id se dhoondne ke liye findByPk (Primary Key) use hota hai
    const collection = await DailyCollection.findByPk(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection record not found" });
    }

    // Weight update kar ke database mein save kar do
    collection.weightKg = parseFloat(weightKg) || 0;
    await collection.save();

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
