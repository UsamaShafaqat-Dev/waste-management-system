import React, { useState, useEffect, useContext, useRef } from "react";
import {
  BookOpen,
  Map,
  Store,
  CreditCard,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Edit,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

const ShopLedger = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [routes, setRoutes] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedShop, setSelectedShop] = useState("");

  const [shopSearchText, setShopSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [localSummary, setLocalSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState(null);

  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    paymentType: "Debit",
    paymentMethod: "Cash",
    notes: "",
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await api.get("/routes");
        setRoutes(data.filter((r) => r.status === "Active"));
      } catch (error) {
        toast.error("Failed to fetch routes");
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedShop("");
    setShopSearchText("");
    setLedgerData(null);
    if (!selectedRoute) {
      setShops([]);
      return;
    }
    const fetchShops = async () => {
      try {
        const { data } = await api.get(
          `/daily-collections/shops/${selectedRoute}`,
        );
        setShops(data);
      } catch (error) {
        toast.error("Failed to fetch shops");
      }
    };
    fetchShops();
  }, [selectedRoute]);

  const fetchLedger = async () => {
    if (!selectedShop) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/ledger/shop/${selectedShop}`);
      setLedgerData(data);

      let totalKg = 0;
      let totalPayable = 0;
      let totalPaid = 0;

      let history = (data.collections || []).map((c) => {
        totalKg += c.weightKg;
        totalPayable += c.amount;
        return {
          ...c,
          type: "Collection",
          credit: c.amount,
          debit: 0,
        };
      });

      const payments = (data.payments || []).map((p) => {
        const isCredit = p.paymentType === "Credit";
        if (isCredit) {
          totalPayable += p.amount;
        } else {
          totalPaid += p.amount;
        }
        return {
          ...p,
          type: "Payment",
          credit: isCredit ? p.amount : 0,
          debit: !isCredit ? p.amount : 0,
        };
      });

      history = [...history, ...payments].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      let runningBalance = 0;
      history = history.map((item) => {
        runningBalance += item.credit - item.debit;
        return { ...item, balance: runningBalance };
      });

      setLedgerHistory(history);
      setLocalSummary({
        totalCollectedKg: totalKg,
        totalPayableAmount: totalPayable,
        totalPaidAmount: totalPaid,
        remainingBalance: runningBalance,
      });
    } catch (error) {
      toast.error("Failed to fetch ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedShop]);

  const handleEditClick = (payment) => {
    setEditPaymentId(payment._id);
    setPaymentData({
      date: new Date(payment.date).toISOString().split("T")[0],
      amount: payment.amount,
      paymentType: payment.paymentType || "Debit",
      paymentMethod: payment.paymentMethod,
      notes: payment.notes || "",
    });
    setShowPaymentForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || paymentData.amount <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setLoading(true);
    try {
      if (editPaymentId) {
        await api.put(`/ledger/payments/${editPaymentId}`, paymentData);
        toast.success(t("Payment updated successfully!"));
      } else {
        await api.post("/ledger/payments", {
          shopId: selectedShop,
          ...paymentData,
        });
        toast.success(t("Payment added successfully!"));
      }

      setPaymentData({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        paymentType: "Debit",
        paymentMethod: "Cash",
        notes: "",
      });
      setEditPaymentId(null);
      setShowPaymentForm(false);
      fetchLedger();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`print:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div>
          <h1
            className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <BookOpen className="text-indigo-600" />{" "}
            {t("Shop Ledger & Payments")}
          </h1>
        </div>
        {ledgerData && (
          <div
            className={`flex gap-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <button
              onClick={() => window.print()}
              className={`bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Printer size={18} /> {t("Save PDF")}
            </button>
            <button
              onClick={() => {
                setShowPaymentForm(!showPaymentForm);
                if (showPaymentForm) setEditPaymentId(null);
              }}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              {showPaymentForm ? (
                t("Cancel")
              ) : (
                <>
                  <Plus size={18} /> {t("Add Payment")}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div
        className={`print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 ${language === "ur" ? "text-right" : "text-left"}`}
      >
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Map size={16} /> {t("Select Route")}
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <option value="">{t("-- Select Route --")}</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        <div className="relative" ref={dropdownRef}>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Store size={16} /> {t("Select Shop")}
          </label>
          <div
            className={`flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-500 ${!selectedRoute ? "bg-gray-100 cursor-not-allowed" : ""} ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Search size={16} className="text-gray-400 mx-2" />
            <input
              type="text"
              placeholder={t("Search Shop by Name...")}
              value={shopSearchText}
              disabled={!selectedRoute}
              onChange={(e) => {
                setShopSearchText(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className={`w-full outline-none bg-transparent ${language === "ur" ? "text-right" : "text-left"}`}
            />
          </div>

          {isDropdownOpen && selectedRoute && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {shops
                .filter(
                  (s) =>
                    s.shopName
                      .toLowerCase()
                      .includes(shopSearchText.toLowerCase()) ||
                    s.ownerName
                      .toLowerCase()
                      .includes(shopSearchText.toLowerCase()),
                )
                .map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      setSelectedShop(s._id);
                      setShopSearchText(`${s.shopName} (${s.ownerName})`);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0 ${language === "ur" ? "text-right" : "text-left"}`}
                  >
                    <span className="font-bold">{s.shopName}</span> -{" "}
                    {s.ownerName}
                  </div>
                ))}
              {shops.filter(
                (s) =>
                  s.shopName
                    .toLowerCase()
                    .includes(shopSearchText.toLowerCase()) ||
                  s.ownerName
                    .toLowerCase()
                    .includes(shopSearchText.toLowerCase()),
              ).length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No shops found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="print:hidden">
        {showPaymentForm && selectedShop && (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <h2
              className={`text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <CreditCard size={20} />{" "}
              {editPaymentId ? t("Edit Payment") : t("Record New Payment")}
            </h2>
            <form
              onSubmit={handlePaymentSubmit}
              className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
            >
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  {t("Date")}
                </label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, date: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 outline-none ${language === "ur" ? "text-right" : ""}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  {t("Amount (Rs.) *")}
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 outline-none ${language === "ur" ? "text-right" : ""}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  {t("Type *")}
                </label>
                <select
                  value={paymentData.paymentType}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentType: e.target.value,
                    })
                  }
                  className={`w-full border rounded-lg px-3 py-2 outline-none bg-white ${language === "ur" ? "text-right" : ""}`}
                >
                  <option value="Debit">
                    {t("Payment / Advance (Debit)")}
                  </option>
                  <option value="Credit">{t("Adjustment (Credit)")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  {t("Method")}
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className={`w-full border rounded-lg px-3 py-2 outline-none bg-white ${language === "ur" ? "text-right" : ""}`}
                >
                  <option value="Cash">{t("Cash")}</option>
                  <option value="Check">{t("Check")}</option>
                  <option value="Bank Transfer">{t("Bank Transfer")}</option>
                  <option value="Other">{t("Other")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  {t("Notes / Check No.")}
                </label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 outline-none ${language === "ur" ? "text-right" : ""}`}
                  placeholder="e.g. Check #123"
                />
              </div>
              <div
                className={`md:col-span-5 flex ${language === "ur" ? "justify-start" : "justify-end"} mt-2`}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium"
                >
                  {loading
                    ? t("Saving...")
                    : editPaymentId
                      ? t("Update Payment")
                      : t("Save Payment")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {localSummary && (
        <div className="space-y-6">
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div className="bg-white p-4 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
              <p className="text-sm text-gray-500">{t("Total Collected")}</p>
              <p className="text-2xl font-bold text-gray-800">
                {localSummary.totalCollectedKg}{" "}
                <span className="text-sm">KG</span> <br />
                <span className="text-sm font-semibold text-blue-600">
                  ({(localSummary.totalCollectedKg / 40).toFixed(2)} {t("Mann")}
                  )
                </span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border-l-4 border-l-green-500 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("Total Payable (Credit)")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {localSummary.totalPayableAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
              <p className="text-sm text-gray-500">{t("Total Paid (Debit)")}</p>
              <p className="text-2xl font-bold text-red-600">
                Rs. {localSummary.totalPaidAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border-l-4 border-l-indigo-500 shadow-sm">
              <p className="text-sm text-gray-500">{t("Remaining Balance")}</p>
              <p
                className={`text-2xl font-bold ${localSummary.remainingBalance < 0 ? "text-red-600" : "text-indigo-700"}`}
              >
                Rs. {localSummary.remainingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse min-w-[800px] ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <thead>
                  <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    {/* 🔥 NAYA: Sr. No Column Header */}
                    <th
                      className={`px-6 py-3 w-16 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Sr. No")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Date")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Description")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Weight / Rate")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Debit (Paid)")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Credit (Payable)")}
                    </th>
                    <th
                      className={`px-6 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Balance")}
                    </th>
                    {user?.role === "Admin" && (
                      <th className="px-6 py-3 text-center print:hidden">
                        {t("Action")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ledgerHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={user?.role === "Admin" ? 8 : 7}
                        className="text-center py-8 text-gray-400"
                      >
                        {t("No transactions found.")}
                      </td>
                    </tr>
                  ) : (
                    ledgerHistory.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 text-sm"
                      >
                        {/* 🔥 NAYA: Sr. No Column Data */}
                        <td className="px-6 py-3 font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-3">
                          {new Date(row.date).toLocaleDateString(
                            language === "ur" ? "ur-PK" : "en-US",
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {row.type === "Collection" ? (
                            <span
                              className={`flex items-center gap-1 text-green-700 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
                            >
                              <ArrowDownRight
                                size={14}
                                className="print:hidden"
                              />{" "}
                              {t("Waste Collection")}
                            </span>
                          ) : (
                            <div>
                              <span
                                className={`flex items-center gap-1 font-medium ${row.paymentType === "Credit" ? "text-green-700" : "text-red-700"} ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
                              >
                                {row.paymentType === "Credit" ? (
                                  <ArrowDownRight
                                    size={14}
                                    className="print:hidden"
                                  />
                                ) : (
                                  <ArrowUpRight
                                    size={14}
                                    className="print:hidden"
                                  />
                                )}
                                {/* 🔥 NAYA: Fixed Payment Formatting */}
                                {t("Payment")} - {t(row.paymentMethod)}
                              </span>
                              {row.notes && (
                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                  {t("Note:")} {row.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-6 py-3 text-gray-500 ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {row.type === "Collection"
                            ? `${row.weightKg} KG @ Rs.${row.ratePerKg || row.rate}`
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-3 text-red-600 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {row.debit > 0
                            ? `Rs. ${row.debit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-3 text-green-600 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {row.credit > 0
                            ? `Rs. ${row.credit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-3 font-bold ${row.balance < 0 ? "text-red-600" : "text-gray-800"} bg-gray-50 ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {row.balance.toLocaleString()}
                        </td>
                        {user?.role === "Admin" && (
                          <td className="px-6 py-3 text-center print:hidden">
                            {row.type === "Payment" ? (
                              <button
                                onClick={() => handleEditClick(row)}
                                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition"
                              >
                                <Edit size={16} />
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopLedger;
