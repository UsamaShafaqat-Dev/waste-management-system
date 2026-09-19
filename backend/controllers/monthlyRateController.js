const MonthlyRate = require("../models/MonthlyRate");
const Shop = require("../models/Shop");

const getMonthlyRates = async (req, res) => {
  try {
    const { month, routeId } = req.query;
    if (!month || !routeId)
      return res.status(400).json({ message: "Month and Route are required" });

    // Route ki tamam active shops nikalen (Sequelize order array use karta hai)
    const shops = await Shop.findAll({
      where: {
        assignedRoute: routeId,
        status: "Active",
      },
      order: [["serialNumber", "ASC"]],
      raw: true, // Plain JavaScript object return karne ke liye
    });

    // Us mahinay ke pehle se saved rates nikalen
    const rates = await MonthlyRate.findAll({
      where: { month, route: routeId },
      raw: true,
    });

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

    // Naye rates ko Sequelize ke format mein map karein
    const formattedRates = rates.map((r) => ({
      month,
      route: routeId,
      shop: r.shopId,
      rate: r.rate,
    }));

    // Mongoose ke bulkWrite (upsert) ki jagah Sequelize ka bulkCreate
    // updateOnDuplicate MySQL ka special feature hai jo duplicate entry milne par usay update kar deta hai
    await MonthlyRate.bulkCreate(formattedRates, {
      updateOnDuplicate: ["rate", "route"],
    });

    res.status(200).json({ message: "Rates saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyRates, saveMonthlyRates };
