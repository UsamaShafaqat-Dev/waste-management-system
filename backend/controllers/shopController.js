const Shop = require("../models/Shop");

const createShop = async (req, res) => {
  try {
    const { shopName, ownerName, contact, address, assignedRoute, status } =
      req.body;

    // 🔥 JADOO: Auto-Increment Serial Number Logic
    // System database mein sab se bara serial number dhoondega
    const lastShop = await Shop.findOne().sort({ serialNumber: -1 });

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
    // 🔥 NAYA: Security check - Agar koi chalaki se serial number bheje toh usay ignore kar do
    if (req.body.serialNumber !== undefined) {
      delete req.body.serialNumber;
    }

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
