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

    // 🔥 NAYA: Route-Specific Duplicate Check (Ab ek route mein duplicate nahi hoga, par alag route mein ho sakega)
    if (serialNumber && Number(serialNumber) > 0 && assignedRoute) {
      const exists = await Shop.findOne({
        assignedRoute: assignedRoute,
        serialNumber: Number(serialNumber),
      });
      if (exists) {
        return res.status(400).json({
          message: `Serial Number ${serialNumber} is already assigned to another shop in THIS route!`,
        });
      }
    }

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
    // Pehle existing shop nikal lein taake route check kar sakein
    const existingShop = await Shop.findById(req.params.id);
    if (!existingShop)
      return res.status(404).json({ message: "Shop not found" });

    // Agar update mein naya route aaya hai toh wo lein, warna purana hi rakhein
    const routeToCheck = req.body.assignedRoute || existingShop.assignedRoute;

    // 🔥 NAYA: Route-Specific Duplicate Check on Update
    if (req.body.serialNumber !== undefined) {
      const num = Number(req.body.serialNumber);
      if (num > 0 && routeToCheck) {
        const exists = await Shop.findOne({
          assignedRoute: routeToCheck,
          serialNumber: num,
          _id: { $ne: req.params.id },
        });
        if (exists) {
          return res.status(400).json({
            message: `Serial Number ${num} is already assigned to another shop in THIS route!`,
          });
        }
      }
    }

    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
