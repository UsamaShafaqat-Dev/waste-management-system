const Payment = require("../models/Payment");
const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");

// @desc    Add a new payment to a shop
// @route   POST /api/ledger/payments
const addPayment = async (req, res) => {
  try {
    const { shopId, date, amount, paymentMethod, notes } = req.body;

    const payment = await Payment.create({
      shop: shopId,
      date,
      amount,
      paymentMethod,
      notes,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete ledger for a specific shop
// @route   GET /api/ledger/shop/:shopId
const getShopLedger = async (req, res) => {
  try {
    const shopId = req.params.shopId;

    // 1. Get Shop Details
    const shop = await Shop.findById(shopId).populate(
      "assignedRoute",
      "routeName",
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    // 2. Get all collections (Credit)
    const collections = await DailyCollection.find({ shop: shopId }).sort({
      date: 1,
    });

    // 3. Get all payments (Debit)
    const payments = await Payment.find({ shop: shopId }).sort({ date: 1 });

    // 4. Calculate Totals
    const totalCollectedKg = collections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );
    const totalPayableAmount = collections.reduce(
      (sum, item) => sum + item.amount,
      0,
    ); // Credit
    const totalPaidAmount = payments.reduce(
      (sum, item) => sum + item.amount,
      0,
    ); // Debit
    const remainingBalance = totalPayableAmount - totalPaidAmount;

    // Combine history for timeline view
    res.status(200).json({
      shopDetails: shop,
      summary: {
        totalCollectedKg,
        totalPayableAmount,
        totalPaidAmount,
        remainingBalance,
      },
      collections,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addPayment, getShopLedger };
