import React, { useState, useEffect } from "react";
import { Book, Calendar, Map, Search, FileText, Printer } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const RouteLedger = () => {
  const [routes, setRoutes] = useState([]);

  // Filters State
  const currentDate = new Date();
  const [selectedRoute, setSelectedRoute] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState(currentDate.getFullYear());

  // Data State
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Routes on load
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

  const fetchSummary = async () => {
    if (!selectedRoute) return toast.error("Please select a route");
    if (!month || !year) return toast.error("Please select month and year");

    setLoading(true);
    try {
      const { data } = await api.get(
        `/summary/route-ledger?routeId=${selectedRoute}&month=${month}&year=${year}`,
      );
      setSummaryData(data);
    } catch (error) {
      setSummaryData(null);
      toast.error(error.response?.data?.message || "Error fetching summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden in Print */}
      <div className="print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Book size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Route-Wise Monthly Ledger Summary
          </h1>
          <p className="text-sm text-gray-500">
            View complete monthly breakdown of a specific route
          </p>
        </div>
      </div>

      {/* Filters Section - Hidden in Print */}
      <div className="print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Map size={16} /> Select Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Select Route --</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} /> Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "short",
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading || !selectedRoute}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors ${
            loading || !selectedRoute
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <Search size={18} />
          {loading ? "Generating..." : "View Summary"}
        </button>
      </div>

      {/* Summary Results */}
      {summaryData && (
        <div className="space-y-6">
          {/* Action Buttons - Hidden in Print */}
          <div className="print:hidden flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Printer size={18} /> Save as PDF
            </button>
          </div>

          {/* Route Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Route Name
              </p>
              <p className="text-lg font-bold text-gray-800">
                {summaryData.routeInfo.routeName}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Vehicle & Driver
              </p>
              <p className="text-lg font-bold text-gray-800">
                {summaryData.routeInfo.vehicle}
              </p>
              <p className="text-xs text-gray-400">
                {summaryData.routeInfo.driver}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Shops Linked
              </p>
              <p className="text-lg font-bold text-gray-800">
                {summaryData.routeInfo.totalShops}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 bg-purple-50 print:bg-white print:border-gray-100">
              <p className="text-xs text-purple-600 print:text-gray-500 uppercase font-semibold">
                Month
              </p>
              <p className="text-lg font-bold text-purple-900 print:text-gray-800">
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </p>
            </div>
          </div>

          {/* Shop Breakdown Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2 print:bg-white print:border-b-2">
              <FileText size={18} className="text-gray-600 print:hidden" />
              <h3 className="font-semibold text-gray-700">Shop Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b print:border-b-2">
                    <th className="px-4 py-3 font-medium">Shop Name</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Rate/KG
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Total KG
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Credit (Payable)
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Debit (Paid)
                    </th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50 print:bg-white">
                      Remaining
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.shopBreakdown.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-gray-400"
                      >
                        No data found for this month.
                      </td>
                    </tr>
                  ) : (
                    summaryData.shopBreakdown.map((shop, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 text-sm print:text-black"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 print:text-black">
                          Rs. {shop.rate}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {shop.kg} KG
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 print:text-black">
                          Rs. {shop.credit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 print:text-black">
                          Rs. {shop.debit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800 bg-gray-50 print:bg-white print:border-l">
                          Rs. {shop.remaining.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {summaryData.shopBreakdown.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black font-bold text-sm">
                      <td colSpan="2" className="px-4 py-4 text-right">
                        Route Totals:
                      </td>
                      <td className="px-4 py-4 text-right text-blue-300 print:text-black">
                        {summaryData.summary.totalShopKg} KG
                      </td>
                      <td className="px-4 py-4 text-right text-green-400 print:text-black">
                        Rs. {summaryData.summary.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-red-400 print:text-black">
                        Rs. {summaryData.summary.totalPaid.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-white text-base bg-gray-900 print:bg-gray-300 print:text-black">
                        Rs.{" "}
                        {summaryData.summary.totalRemaining.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Factory vs Shop Weight Comparison */}
          {summaryData.shopBreakdown.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Shop KG
                  </p>
                  <p className="text-2xl font-bold text-blue-600 print:text-black">
                    {summaryData.summary.totalShopKg} KG
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Factory KG
                  </p>
                  <p className="text-2xl font-bold text-teal-600 print:text-black">
                    {summaryData.summary.totalFactoryKg} KG
                  </p>
                </div>
              </div>
              <div
                className={`p-4 rounded-xl shadow-sm border flex justify-between items-center ${summaryData.summary.totalDifference > 0 ? "bg-blue-50 border-blue-200" : summaryData.summary.totalDifference < 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} print:bg-white print:border-gray-300`}
              >
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Difference
                  </p>
                  <p
                    className={`text-2xl font-bold ${summaryData.summary.totalDifference > 0 ? "text-blue-700" : summaryData.summary.totalDifference < 0 ? "text-red-700" : "text-gray-700"} print:text-black`}
                  >
                    {summaryData.summary.totalDifference > 0 ? "+" : ""}
                    {summaryData.summary.totalDifference} KG
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteLedger;
