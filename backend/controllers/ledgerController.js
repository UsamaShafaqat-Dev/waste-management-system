const Payment = require("../models/Payment");
const DailyCollection = require("../models/DailyCollection");
const Shop = require("../models/Shop");
const MonthlyRate = require("../models/MonthlyRate");
const Route = require("../models/Route"); // Populate mimic karne ke liye import kiya

// @desc    Add a new payment to a shop
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
const editPayment = async (req, res) => {
  try {
    const { date, amount, paymentType, paymentMethod, notes } = req.body;

    // Sequelize mein findByIdAndUpdate ki jagah findByPk aur save use hota hai
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.date = date;
    payment.amount = amount;
    payment.paymentType = paymentType;
    payment.paymentMethod = paymentMethod;
    payment.notes = notes;

    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete ledger for a specific shop for a specific month
// @route   GET /api/ledger/shop/:shopId?month=YYYY-MM
const getShopLedger = async (req, res) => {
  try {
    const shopId = req.params.shopId;

    // Agar frontend se month aaye toh theek, werna current month le lein
    let targetMonthStr = req.query.month;
    if (!targetMonthStr) {
      targetMonthStr = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    }

    // Target month ki start aur end dates nikal lein
    const [year, month] = targetMonthStr.split("-");
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Mongoose populate() ko mimic karne ke liye manual fetch
    const shopObj = await Shop.findByPk(shopId, { raw: true });
    if (!shopObj) return res.status(404).json({ message: "Shop not found" });

    const routeObj = await Route.findByPk(shopObj.assignedRoute, { raw: true });

    // Shop object mein route wese hi attach kar diya jaise Mongoose karta tha
    const shop = {
      ...shopObj,
      assignedRoute: routeObj
        ? { _id: routeObj._id, routeName: routeObj.routeName }
        : { _id: shopObj.assignedRoute, routeName: "Unknown" },
    };

    // 1. ALL HISTORY FETCH (Taake opening balance nikal sakein)
    const allCollections = await DailyCollection.findAll({
      where: { shop: shopId },
      order: [["date", "ASC"]], // Ascending order
      raw: true,
    });

    const allPayments = await Payment.findAll({
      where: { shop: shopId },
      order: [["date", "ASC"]],
      raw: true,
    });

    const allRates = await MonthlyRate.findAll({
      where: { shop: shopId },
      raw: true,
    });

    let openingPayable = 0;
    let openingPaid = 0;

    // 2. OPENING BALANCE CALCULATION (Target month se pehle ka sara record)
    allCollections.forEach((c) => {
      if (new Date(c.date) < startDate) {
        const cMonthStr = new Date(c.date).toISOString().slice(0, 7);
        const rateObj = allRates.find((r) => r.month === cMonthStr);
        const rateToApply = rateObj ? rateObj.rate : shop.ratePerKg || 0;
        openingPayable += c.weightKg * rateToApply;
      }
    });

    allPayments.forEach((p) => {
      if (new Date(p.date) < startDate) {
        if (p.paymentType === "Credit") {
          openingPayable += p.amount;
        } else {
          openingPaid += p.amount;
        }
      }
    });

    const openingBalance = openingPayable - openingPaid;

    // 3. CURRENT MONTH DATA CALCULATION
    const currentMonthRateObj = allRates.find(
      (r) => r.month === targetMonthStr,
    );
    const currentRate = currentMonthRateObj
      ? currentMonthRateObj.rate
      : shop.ratePerKg || 0;

    const targetCollections = allCollections.filter(
      (c) => new Date(c.date) >= startDate && new Date(c.date) <= endDate,
    );
    const targetPayments = allPayments.filter(
      (p) => new Date(p.date) >= startDate && new Date(p.date) <= endDate,
    );

    const totalCollectedKg = targetCollections.reduce(
      (sum, item) => sum + item.weightKg,
      0,
    );
    const wastePayable = totalCollectedKg * currentRate;

    const creditPayments = targetPayments
      .filter((p) => p.paymentType === "Credit")
      .reduce((sum, item) => sum + item.amount, 0);

    const currentMonthPayable = wastePayable + creditPayments;

    const totalPaidAmount = targetPayments
      .filter((p) => p.paymentType === "Debit" || !p.paymentType)
      .reduce((sum, item) => sum + item.amount, 0);

    // Total Payable (Pichla bacha hua + is mahine ka naya)
    const totalPayableAmount = openingBalance + currentMonthPayable;

    // Remaining Balance
    const remainingBalance = totalPayableAmount - totalPaidAmount;

    // Format current month collections
    const updatedCollections = targetCollections.map((c) => ({
      ...c, // Sequelize 'raw: true' mein _doc ki zaroorat nahi hoti
      ratePerKg: currentRate,
      amount: c.weightKg * currentRate,
    }));

    res.status(200).json({
      shopDetails: shop,
      openingBalance, // 🔥 Opening Balance
      summary: {
        totalCollectedKg,
        currentMonthPayable,
        totalPayableAmount,
        totalPaidAmount,
        remainingBalance,
      },
      collections: updatedCollections,
      payments: targetPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addPayment, editPayment, getShopLedger };
