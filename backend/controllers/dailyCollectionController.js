const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");
const { Op } = require("sequelize");

// @desc    Save or Update daily collection for a route
// @route   POST /api/daily-collections
const createDailyCollection = async (req, res) => {
  try {
    const { date, routeId, vehicleId, collections } = req.body;

    // Set time to start of the day for consistent checking
    const collectionDate = new Date(date);
    collectionDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 🔥 NAYA: Ab hum error nahi denge, balke loop chala kar check karenge.
    // Agar entry pehle se mojood hai toh 'Update' karenge, nahi toh 'Nayi Create' karenge.
    for (let item of collections) {
      const existingEntry = await DailyCollection.findOne({
        where: {
          route: routeId,
          shop: item.shopId,
          date: {
            [Op.between]: [collectionDate, endOfDay],
          },
        },
      });

      if (existingEntry) {
        // Agar pehle se wazan mojood hai toh naya wazan update kar do
        existingEntry.weightKg = item.weightKg || 0;
        existingEntry.vehicle = vehicleId;
        await existingEntry.save();
      } else {
        // Agar pehle se nahi hai toh naya record bana do
        await DailyCollection.create({
          date: collectionDate,
          route: routeId,
          vehicle: vehicleId,
          shop: item.shopId,
          weightKg: item.weightKg || 0,
          ratePerKg: 0,
          amount: 0,
        });
      }
    }

    res
      .status(200)
      .json({ message: "Daily Collection Saved/Updated Successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shops by route ID for the form dropdowns (With previous weight if exists)
// @route   GET /api/daily-collections/shops/:routeId
const getShopsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { date } = req.query; // Frontend se aane wali date

    // 1. Sab active dukaanein nikalo aur Serial Number ki tarteeb (Ascending) se lagao
    const shops = await Shop.findAll({
      where: {
        assignedRoute: routeId,
        status: "Active",
      },
      order: [["serialNumber", "ASC"]], // 🔥 NAYA: Point 2 (Serial number wali tarteeb) fix ho gayi
    });

    let collectionsMap = {};

    // 2. Agar date aayi hai, toh us din ka pehle se save shuda wazan database se nikalo
    if (date) {
      const collectionDate = new Date(date);
      collectionDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingCollections = await DailyCollection.findAll({
        where: {
          route: routeId,
          date: {
            [Op.between]: [collectionDate, endOfDay],
          },
        },
      });

      // Shop id ke hisaab se wazan ko map kar lo
      existingCollections.forEach((col) => {
        const sId = col.shop || col.shopId; // Foreign key check
        collectionsMap[sId] = col.weightKg;
      });
    }

    // 3. Dukaanon ke data ke sath purana wazan attach kar do
    const mergedShops = shops.map((shop) => {
      const shopObj = shop.toJSON(); // Sequelize object ko normal object banaya
      const sId = shopObj.id || shopObj._id;

      // Agar is dukaan ka wazan is date par mojood hai toh frontend ko bhej do
      if (collectionsMap[sId] !== undefined) {
        shopObj.weightKg = collectionsMap[sId];
      }
      return shopObj;
    });

    res.status(200).json(mergedShops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a specific daily collection weight
// @route   PUT /api/daily-collections/:id
const updateCollectionWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { weightKg } = req.body;

    const collection = await DailyCollection.findByPk(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection record not found" });
    }

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
