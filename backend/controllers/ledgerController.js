const Payment = require("../models/Payment");
const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");
const MonthlyRate = require("../models/MonthlyRate"); // 🔥 NAYA IMPORT

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
    const currentMonthStr = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    const shop = await Shop.findById(shopId).populate(
      "assignedRoute",
      "routeName",
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const collections = await DailyCollection.find({ shop: shopId }).sort({
      date: 1,
    });
    const payments = await Payment.find({ shop: shopId }).sort({ date: 1 });

    // 🔥 NAYA: Monthly Rate nikalna
    const monthlyRate = await MonthlyRate.findOne({
      shop: shopId,
      month: currentMonthStr,
    });
    const currentRate = monthlyRate ? monthlyRate.rate : 0; // Agar rate nahi laga toh 0

    const totalCollectedKg = collections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );

    // 🔥 NAYA: Total Payable (Weight * Monthly Rate)
    const wastePayable = totalCollectedKg * currentRate;

    const creditPayments = payments
      .filter((p) => p.paymentType === "Credit")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalPayableAmount = wastePayable + creditPayments;

    // Total Paid (Debit)
    const totalPaidAmount = payments
      .filter((p) => p.paymentType === "Debit" || !p.paymentType)
      .reduce((sum, item) => sum + item.amount, 0);

    const remainingBalance = totalPayableAmount - totalPaidAmount;

    // Har collection ke sath rate aur amount attach karna
    const updatedCollections = collections.map((c) => ({
      ...c._doc,
      ratePerKg: currentRate,
      amount: c.weightKg * currentRate,
    }));

    res.status(200).json({
      shopDetails: shop,
      summary: {
        totalCollectedKg,
        totalPayableAmount,
        totalPaidAmount,
        remainingBalance,
      },
      collections: updatedCollections,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addPayment, editPayment, getShopLedger };
