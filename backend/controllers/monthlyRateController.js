const MonthlyRate = require("../models/MonthlyRate");
const Shop = require("../models/Shop");

const getMonthlyRates = async (req, res) => {
  try {
    const { month, routeId } = req.query;
    if (!month || !routeId)
      return res.status(400).json({ message: "Month and Route are required" });

    // Route ki tamam active shops nikalen
    const shops = await Shop.find({
      assignedRoute: routeId,
      status: "Active",
    }).sort({ serialNumber: 1 });
    // Us mahinay ke pehle se saved rates nikalen
    const rates = await MonthlyRate.find({ month, route: routeId });

    // Dono ko mila kar data tayyar karein
    const data = shops.map((shop) => {
      const existingRate = rates.find(
        (r) => r.shop.toString() === shop._id.toString(),
      );
      return {
        shopId: shop._id,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        serialNumber: shop.serialNumber,
        rate: existingRate ? existingRate.rate : "",
      };
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveMonthlyRates = async (req, res) => {
  try {
    const { month, routeId, rates } = req.body;

    // Naye rates ko update ya insert (upsert) karein
    const bulkOps = rates.map((r) => ({
      updateOne: {
        filter: { month, shop: r.shopId },
        update: { month, route: routeId, shop: r.shopId, rate: r.rate },
        upsert: true,
      },
    }));

    await MonthlyRate.bulkWrite(bulkOps);
    res.status(200).json({ message: "Rates saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyRates, saveMonthlyRates };
