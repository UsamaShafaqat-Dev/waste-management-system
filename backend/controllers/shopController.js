const Shop = require("../models/Shop");

// @desc    Create a new shop
const createShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      ratePerKg,
      status,
    } = req.body;

    const shop = await Shop.create({
      shopName,
      ownerName,
      contact,
      address,
      assignedRoute,
      ratePerKg,
      status,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all shops
const getShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("assignedRoute", "routeName");
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a shop
// @route   PUT /api/shops/:id
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

// @desc    Delete a shop
// @route   DELETE /api/shops/:id
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
