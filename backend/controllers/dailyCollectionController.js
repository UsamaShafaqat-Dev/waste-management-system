const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");
const FactoryWeight = require("../models/FactoryWeight"); // Factory Weight ko import karna zaroori hai
const { Op } = require("sequelize");

// @desc    Save or Update daily collection AND Factory Weight for a route
// @route   POST /api/daily-collections
const createDailyCollection = async (req, res) => {
  try {
    const { date, routeId, vehicleId, collections, factoryWeight } = req.body;

    const collectionDate = new Date(date);
    collectionDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let totalShopWeight = 0;

    // 1. Dukaano ki wasooli save/update karein
    for (let item of collections) {
      const weight = item.weightKg || 0;
      totalShopWeight += weight;

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
        existingEntry.weightKg = weight;
        existingEntry.vehicle = vehicleId;
        await existingEntry.save();
      } else {
        await DailyCollection.create({
          date: collectionDate,
          route: routeId,
          vehicle: vehicleId,
          shop: item.shopId,
          weightKg: weight,
          ratePerKg: 0,
          amount: 0,
        });
      }
    }

    // 2. Factory Weight save/update karein
    if (factoryWeight !== undefined && factoryWeight !== null) {
      const existingFactoryEntry = await FactoryWeight.findOne({
        where: {
          route: routeId,
          date: { [Op.between]: [collectionDate, endOfDay] },
        },
      });

      const parsedFactoryWeight = parseFloat(factoryWeight) || 0;
      const difference = parsedFactoryWeight - totalShopWeight;
      let status = "Balanced";

      if (difference > 0) status = "Extra";
      if (difference < 0) status = "Shortage";

      if (existingFactoryEntry) {
        // Agar factory weight ki entry pehle se hai toh update karein
        existingFactoryEntry.totalShopWeight = totalShopWeight;
        existingFactoryEntry.factoryWeight = parsedFactoryWeight;
        existingFactoryEntry.difference = difference;
        existingFactoryEntry.status = status;
        await existingFactoryEntry.save();
      } else {
        // Agar nahi hai toh nayi create karein
        await FactoryWeight.create({
          date: collectionDate,
          route: routeId,
          vehicle: vehicleId,
          totalShopWeight: totalShopWeight,
          factoryWeight: parsedFactoryWeight,
          difference: difference,
          status: status,
          notes: "Auto-saved from Daily Collection Form",
        });
      }
    }

    res
      .status(200)
      .json({
        message: "Daily Collection & Factory Weight Saved Successfully!",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shops by route ID for the form dropdowns (With previous weights)
// @route   GET /api/daily-collections/shops/:routeId
const getShopsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { date } = req.query;

    // Dukanein Serial Number ki tarteeb se nikalen
    const shops = await Shop.findAll({
      where: {
        assignedRoute: routeId,
        status: "Active",
      },
      order: [["serialNumber", "ASC"]],
    });

    let collectionsMap = {};
    let factoryWeightKg = "";

    if (date) {
      const collectionDate = new Date(date);
      collectionDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Purani Collection Nikalen
      const existingCollections = await DailyCollection.findAll({
        where: {
          route: routeId,
          date: {
            [Op.between]: [collectionDate, endOfDay],
          },
        },
      });

      existingCollections.forEach((col) => {
        const sId = col.shop || col.shopId;
        collectionsMap[sId] = col.weightKg;
      });

      // Purana Factory Weight nikalen taake frontend pe dikhaya ja sake
      const existingFactoryWeight = await FactoryWeight.findOne({
        where: {
          route: routeId,
          date: {
            [Op.between]: [collectionDate, endOfDay],
          },
        },
      });
      if (existingFactoryWeight) {
        factoryWeightKg = existingFactoryWeight.factoryWeight;
      }
    }

    // Dukaanon k data me purana wazan aur factory weight shamil kar den
    const mergedShops = shops.map((shop, index) => {
      const shopObj = shop.toJSON();
      const sId = shopObj.id || shopObj._id;

      if (collectionsMap[sId] !== undefined) {
        shopObj.weightKg = collectionsMap[sId];
      }

      // Pehli dukaan k object me factory weight bhej den (frontend handle kar lega)
      if (index === 0) {
        shopObj.factoryWeightKg = factoryWeightKg;
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
