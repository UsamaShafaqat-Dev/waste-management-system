const Shop = require("../models/Shop");

const createShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      serialNumber,
      status,
    } = req.body;

    const shop = await Shop.create({
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      serialNumber: serialNumber || 0,
      status,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShops = async (req, res) => {
  try {
    // 🔥 Shops ko Serial Number ke hisab se sort kiya gaya hai
    const shops = await Shop.find()
      .populate("assignedRoute", "routeName")
      .sort({ serialNumber: 1 });
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createShop, getShops, updateShop, deleteShop };
