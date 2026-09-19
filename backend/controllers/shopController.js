const { Op } = require("sequelize");
const Shop = require("../models/Shop");
const Route = require("../models/Route"); // Populate mimic karne ke liye import kiya hai

const createShop = async (req, res) => {
  try {
    const { shopName, ownerName, contact, address, assignedRoute, status } =
      req.body;

    // 🔥 JADOO: Auto-Increment Serial Number Logic
    // System database mein sab se bara serial number dhoondega
    const lastShop = await Shop.findOne({
      order: [["serialNumber", "DESC"]], // Sequelize mein descending sort ka tareeqa
    });

    let nextSerialNumber = 10001; // Default start number (agar DB khali ho)

    if (lastShop && lastShop.serialNumber >= 10001) {
      nextSerialNumber = lastShop.serialNumber + 1; // 10002, 10003...
    } else if (lastShop && lastShop.serialNumber > 0) {
      // Agar pehle se 1, 2, 3 type ke number chal rahay hain, toh usi mein +1 kar dega
      nextSerialNumber = lastShop.serialNumber + 1;
    }

    const shop = await Shop.create({
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      serialNumber: nextSerialNumber, // 👈 System ab khud number dega
      status,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShops = async (req, res) => {
  try {
    // Shops ko Serial Number ke hisab se sort kiya gaya hai
    const rawShops = await Shop.findAll({
      order: [["serialNumber", "ASC"]],
      raw: true,
    });

    // Populate "assignedRoute" ko mimic karne ki logic
    const routeIds = [
      ...new Set(
        rawShops.map((s) => s.assignedRoute).filter((id) => id != null),
      ),
    ];
    const routes = await Route.findAll({
      where: { _id: { [Op.in]: routeIds } },
      attributes: ["_id", "routeName"], // Sirf zaroori details
      raw: true,
    });

    const shops = rawShops.map((shop) => {
      const routeObj = routes.find((r) => r._id === shop.assignedRoute);
      return {
        ...shop,
        assignedRoute: routeObj || null,
      };
    });

    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateShop = async (req, res) => {
  try {
    // 🔥 NAYA: Security check - Agar koi chalaki se serial number bheje toh usay ignore kar do
    if (req.body.serialNumber !== undefined) {
      delete req.body.serialNumber;
    }

    // Sequelize mein findByIdAndUpdate ki jagah
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Dynamic data update
    Object.keys(req.body).forEach((key) => {
      shop[key] = req.body[key];
    });
    await shop.save();

    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteShop = async (req, res) => {
  try {
    // Sequelize mein findByIdAndDelete ki jagah
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    await shop.destroy();

    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createShop, getShops, updateShop, deleteShop };
