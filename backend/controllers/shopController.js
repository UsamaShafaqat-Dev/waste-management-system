const { Op } = require("sequelize");
const Shop = require("../models/Shop");
const Route = require("../models/Route");

const createShop = async (req, res) => {
  try {
    const { shopName, ownerName, contact, address, assignedRoute, status } =
      req.body;

    const lastShop = await Shop.findOne({
      order: [["serialNumber", "DESC"]],
    });

    let nextSerialNumber = 10001;

    if (lastShop && lastShop.serialNumber >= 10001) {
      nextSerialNumber = lastShop.serialNumber + 1;
    } else if (lastShop && lastShop.serialNumber > 0) {
      nextSerialNumber = lastShop.serialNumber + 1;
    }

    const shop = await Shop.create({
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      serialNumber: nextSerialNumber,
      status,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShops = async (req, res) => {
  try {
    const rawShops = await Shop.findAll({
      order: [["serialNumber", "ASC"]],
      raw: true,
    });

    const routeIds = [
      ...new Set(
        rawShops.map((s) => s.assignedRoute).filter((id) => id != null),
      ),
    ];
    const routes = await Route.findAll({
      where: { _id: { [Op.in]: routeIds } },
      attributes: ["_id", "routeName"],
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
    // 🔥 NAYA: Pehle wala security block hata diya gaya hai.
    // Ab client apni marzi se edit form se serial number change kar sakega!

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
