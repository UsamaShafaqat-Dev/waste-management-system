import React, { useState, useEffect, useContext } from "react";
import { Book, Calendar, Map, Search, FileText, Printer } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { LanguageContext } from "../context/LanguageContext";

const RouteLedger = () => {
  const { t, language } = useContext(LanguageContext);

  const [routes, setRoutes] = useState([]);

  const currentDate = new Date();
  const [selectedRoute, setSelectedRoute] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!selectedRoute) return toast.error(t("Please select a route"));
    if (!month || !year) return toast.error(t("Please select month and year"));

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
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Book size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {t("Route-Wise Monthly Ledger Summary")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("View complete monthly breakdown of a specific route")}
          </p>
        </div>
      </div>

      <div
        className={`print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div className="flex-1 min-w-[200px]">
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Map size={16} /> {t("Select Route")}
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <option value="">{t("-- Select Route --")}</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Calendar size={16} /> {t("Month")}
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString(
                  language === "ur" ? "ur-PK" : "en-US",
                  {
                    month: "short",
                  },
                )}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {t("Year")}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${language === "ur" ? "text-right" : "text-left"}`}
          />
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading || !selectedRoute}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors ${
            loading || !selectedRoute
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <Search size={18} />
          {loading ? t("Generating...") : t("View Summary")}
        </button>
      </div>

      {summaryData && (
        <div className="space-y-6">
          <div
            className={`print:hidden flex ${language === "ur" ? "justify-start" : "justify-end"}`}
          >
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg transition-colors shadow-sm ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Printer size={18} /> {t("Save as PDF")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                {t("Route Name")}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {summaryData.routeInfo.routeName}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                {t("Vehicle & Driver")}
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
                {t("Total Shops Linked")}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {summaryData.routeInfo.totalShops}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 bg-purple-50 print:bg-white print:border-gray-100">
              <p className="text-xs text-purple-600 print:text-gray-500 uppercase font-semibold">
                {t("Month")}
              </p>
              <p className="text-lg font-bold text-purple-900 print:text-gray-800">
                {new Date(0, month - 1).toLocaleString(
                  language === "ur" ? "ur-PK" : "en-US",
                  {
                    month: "long",
                  },
                )}{" "}
                {year}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className={`p-4 border-b bg-gray-50 flex items-center gap-2 print:bg-white print:border-b-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <FileText size={18} className="text-gray-600 print:hidden" />
              <h3 className="font-semibold text-gray-700">
                {t("Shop Breakdown")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b print:border-b-2">
                    {/* 🔥 NAYA: Sr. No Column */}
                    <th
                      className={`px-4 py-3 font-medium w-16 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Sr. No")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Shop Name")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Rate/KG")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Total KG")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Credit (Payable)")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Debit (Paid)")}
                    </th>
                    <th
                      className={`px-4 py-3 font-medium bg-gray-50 print:bg-white ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Remaining")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.shopBreakdown.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-gray-400"
                      >
                        {t("No data found for this month.")}
                      </td>
                    </tr>
                  ) : (
                    summaryData.shopBreakdown.map((shop, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 text-sm print:text-black"
                      >
                        {/* 🔥 NAYA: Sr. No Display (Read-only) */}
                        <td className="px-4 py-3 text-gray-500 font-medium">
                          {shop.serialNumber || index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {shop.shopName}
                        </td>
                        <td
                          className={`px-4 py-3 text-gray-500 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {(shop.rate || 0).toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-3 font-semibold ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {shop.kg} KG
                        </td>
                        <td
                          className={`px-4 py-3 text-green-600 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {shop.credit.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-3 text-red-600 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {shop.debit.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold text-gray-800 bg-gray-50 print:bg-white print:border-l ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {shop.remaining.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {summaryData.shopBreakdown.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black font-bold text-sm">
                      <td
                        colSpan="3" // 🔥 Span barha diya kyunke ek column zyada ho gaya hai
                        className={`px-4 py-4 ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {t("Route Totals:")}
                      </td>
                      <td
                        className={`px-4 py-4 text-blue-300 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {summaryData.summary.totalShopKg} KG
                      </td>
                      <td
                        className={`px-4 py-4 text-green-400 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        Rs. {summaryData.summary.totalAmount.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-4 text-red-400 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        Rs. {summaryData.summary.totalPaid.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-4 text-white text-base bg-gray-900 print:bg-gray-300 print:text-black ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        Rs.{" "}
                        {summaryData.summary.totalRemaining.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {summaryData.shopBreakdown.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {t("Total Shop KG")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 print:text-black">
                    {summaryData.summary.totalShopKg} KG
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {t("Total Factory KG")}
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
                    {t("Total Difference")}
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
