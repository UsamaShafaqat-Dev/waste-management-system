const Payment = require("../models/Payment");
const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");

// @desc    Add a new payment to a shop
// @route   POST /api/ledger/payments
const addPayment = async (req, res) => {
  try {
    const { shopId, date, amount, paymentType, paymentMethod, notes } =
      req.body;

    const payment = await Payment.create({
      shop: shopId,
      date,
      amount,
      paymentType: paymentType || "Debit",
      paymentMethod,
      notes,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit an existing payment (ADMIN ONLY)
// @route   PUT /api/ledger/payments/:id
const editPayment = async (req, res) => {
  try {
    const { date, amount, paymentType, paymentMethod, notes } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { date, amount, paymentType, paymentMethod, notes },
      { new: true },
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete ledger for a specific shop
// @route   GET /api/ledger/shop/:shopId
const getShopLedger = async (req, res) => {
  try {
    const shopId = req.params.shopId;

    const shop = await Shop.findById(shopId).populate(
      "assignedRoute",
      "routeName",
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const collections = await DailyCollection.find({ shop: shopId }).sort({
      date: 1,
    });
    const payments = await Payment.find({ shop: shopId }).sort({ date: 1 });

    const totalCollectedKg = collections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );

    // Total Payable (Credit): Waste Amount + Any Credit Payments
    const wastePayable = collections.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const creditPayments = payments
      .filter((p) => p.paymentType === "Credit")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalPayableAmount = wastePayable + creditPayments;

    // Total Paid (Debit)
    const totalPaidAmount = payments
      .filter((p) => p.paymentType === "Debit" || !p.paymentType)
      .reduce((sum, item) => sum + item.amount, 0);

    const remainingBalance = totalPayableAmount - totalPaidAmount;

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

module.exports = { addPayment, editPayment, getShopLedger };
