import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Map,
  Store,
  CreditCard,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const ShopLedger = () => {
  const [routes, setRoutes] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedShop, setSelectedShop] = useState("");

  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "Cash",
    notes: "",
  });

  // 1. Fetch Routes on load
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

  // 2. Fetch Shops when Route changes
  useEffect(() => {
    setSelectedShop("");
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

  // 3. Fetch Ledger Data when Shop changes
  const fetchLedger = async () => {
    if (!selectedShop) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/ledger/shop/${selectedShop}`);
      setLedgerData(data);

      let history = [];
      if (data.collections) {
        history = [
          ...history,
          ...data.collections.map((c) => ({
            ...c,
            type: "Collection",
            credit: c.amount,
            debit: 0,
          })),
        ];
      }
      if (data.payments) {
        history = [
          ...history,
          ...data.payments.map((p) => ({
            ...p,
            type: "Payment",
            credit: 0,
            debit: p.amount,
          })),
        ];
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));

      let runningBalance = 0;
      history = history.map((item) => {
        runningBalance += item.credit - item.debit;
        return { ...item, balance: runningBalance };
      });

      setLedgerHistory(history);
    } catch (error) {
      toast.error("Failed to fetch ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedShop]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || paymentData.amount <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setLoading(true);
    try {
      await api.post("/ledger/payments", {
        shopId: selectedShop,
        ...paymentData,
      });
      toast.success("Payment added successfully!");

      setPaymentData({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        paymentMethod: "Cash",
        notes: "",
      });
      setShowPaymentForm(false);
      fetchLedger();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden in Print */}
      <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Shop Ledger & Payments
          </h1>
          <p className="text-sm text-gray-500">
            View shop accounts, balances, and add payments
          </p>
        </div>
        {ledgerData && (
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Printer size={18} /> Save PDF
            </button>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {showPaymentForm ? (
                "Cancel Payment"
              ) : (
                <>
                  <Plus size={18} /> Add Payment
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Selectors - Hidden in Print */}
      <div className="print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Map size={16} /> Select Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Route --</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Store size={16} /> Select Shop
          </label>
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            disabled={!selectedRoute}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <option value="">-- Select Shop --</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.shopName} ({s.ownerName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Form - Hidden in Print */}
      <div className="print:hidden">
        {showPaymentForm && selectedShop && (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} /> Record New Payment (Debit)
            </h2>
            <form
              onSubmit={handlePaymentSubmit}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, date: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-indigo-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional notes"
                />
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Print Only Header (This will only show up in PDF) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Shop Ledger Account
        </h1>
        <p className="text-gray-600 mt-1">
          Route: {routes.find((r) => r._id === selectedRoute)?.routeName}
        </p>
        <p className="text-gray-600">
          Shop: {shops.find((s) => s._id === selectedShop)?.shopName}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Printed on: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Ledger Summary & Table */}
      {ledgerData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-gray-800">
                {ledgerData.summary.totalCollectedKg}{" "}
                <span className="text-sm font-normal">KG</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <p className="text-sm text-gray-500">Total Payable (Credit)</p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {ledgerData.summary.totalPayableAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
              <p className="text-sm text-gray-500">Total Paid (Debit)</p>
              <p className="text-2xl font-bold text-red-600">
                Rs. {ledgerData.summary.totalPaidAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
              <p className="text-sm text-gray-500">Remaining Balance</p>
              <p className="text-2xl font-bold text-indigo-700">
                Rs. {ledgerData.summary.remainingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Ledger History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                Transaction History
              </h3>
              <span className="text-xs text-gray-500 print:hidden">
                Showing all collections and payments
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Weight / Rate
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      Debit (Paid)
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      Credit (Payable)
                    </th>
                    <th className="px-6 py-3 font-medium text-right bg-gray-50">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-gray-400"
                      >
                        No transactions found for this shop.
                      </td>
                    </tr>
                  ) : (
                    ledgerHistory.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 text-sm print:text-black"
                      >
                        <td className="px-6 py-3 text-gray-600 print:text-black">
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          {row.type === "Collection" ? (
                            <span className="flex items-center gap-1 text-green-700 print:text-black">
                              <ArrowDownRight
                                size={14}
                                className="print:hidden"
                              />{" "}
                              Daily Waste Collection
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-700 print:text-black">
                              <ArrowUpRight
                                size={14}
                                className="print:hidden"
                              />{" "}
                              Payment to Shop ({row.paymentMethod})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-500 print:text-black">
                          {row.type === "Collection"
                            ? `${row.weightKg} KG @ Rs.${row.rate || (row.weightKg ? row.credit / row.weightKg : 0)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-3 text-right text-red-600 font-medium print:text-black">
                          {row.debit > 0
                            ? `Rs. ${row.debit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-3 text-right text-green-600 font-medium print:text-black">
                          {row.credit > 0
                            ? `Rs. ${row.credit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-gray-800 bg-gray-50 print:bg-white print:border-l">
                          Rs. {row.balance.toLocaleString()}
                        </td>
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
