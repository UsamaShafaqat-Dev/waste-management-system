import React, { useState, useEffect, useContext } from "react";
import { Calculator, Calendar, Map, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { LanguageContext } from "../context/LanguageContext";

const MonthlyRate = () => {
  const { t, language } = useContext(LanguageContext);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routes, setRoutes] = useState([]);

  const [shopRates, setShopRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [bulkRate, setBulkRate] = useState("");

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
    if (!selectedRoute || !filterMonth) {
      setShopRates([]);
      return;
    }
    const fetchRates = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(
          `/monthly-rates?month=${filterMonth}&routeId=${selectedRoute}`,
        );
        setShopRates(data);
      } catch (error) {
        toast.error("Failed to load shop data");
      } finally {
        setFetching(false);
      }
    };
    fetchRates();
  }, [selectedRoute, filterMonth]);

  const handleRateChange = (index, value) => {
    const updatedRates = [...shopRates];
    updatedRates[index].rate = value;
    setShopRates(updatedRates);
  };

  const handleApplyToAll = () => {
    if (!bulkRate || bulkRate <= 0)
      return toast.error(t("Please enter a valid rate"));
    const updatedRates = shopRates.map((shop) => ({ ...shop, rate: bulkRate }));
    setShopRates(updatedRates);
    toast.success(t("Applied to all shops"));
  };

  const handleSubmit = async () => {
    const hasEmptyRates = shopRates.some((s) => s.rate === "" || s.rate < 0);
    if (hasEmptyRates) return toast.error(t("Please fill all rates"));

    setLoading(true);
    try {
      const payload = {
        month: filterMonth,
        routeId: selectedRoute,
        rates: shopRates.map((s) => ({
          shopId: s.shopId,
          rate: parseFloat(s.rate),
        })),
      };
      await api.post("/monthly-rates", payload);
      toast.success(t("Rates saved successfully"));
    } catch (error) {
      toast.error("Failed to save rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1
          className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <Calculator className="text-purple-600" />{" "}
          {t("Monthly Rate Calculation")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("Set rates for shops at the end of the month")}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Calendar size={16} /> {t("Select Month")}
          </label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 ${language === "ur" ? "text-right" : ""}`}
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Map size={16} /> {t("Select Route")}
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 bg-white ${language === "ur" ? "text-right" : ""}`}
          >
            <option value="">{t("-- Select Route --")}</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRoute && filterMonth && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className={`p-4 bg-purple-50 border-b border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <span className="font-bold text-purple-900">
                {t("Apply to All")}:
              </span>
              <input
                type="number"
                min="0"
                value={bulkRate}
                onChange={(e) => setBulkRate(e.target.value)}
                placeholder={t("Rate (Rs.)")}
                className={`w-32 border rounded px-3 py-1.5 outline-none focus:border-purple-500 ${language === "ur" ? "text-right" : ""}`}
              />
              <button
                onClick={handleApplyToAll}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
              >
                {t("Apply")}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || shopRates.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-bold transition-all ${loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"} ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Save size={18} /> {loading ? t("Saving...") : t("Save Rates")}
            </button>
          </div>

          {fetching ? (
            <div className="text-center py-8 text-gray-500">
              {t("Loading shops...")}
            </div>
          ) : shopRates.length === 0 ? (
            <div className="text-center py-8 text-red-500">
              {t("No shops found.")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <thead>
                  <tr className="bg-gray-800 text-white text-sm">
                    <th
                      className={`px-6 py-4 w-20 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Sr. No")}
                    </th>
                    <th
                      className={`px-6 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Shop Name")}
                    </th>
                    <th
                      className={`px-6 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Rate (Rs.)")}
                    </th>
                    <th
                      className={`px-6 py-4 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shopRates.map((shop, index) => (
                    <tr
                      key={shop.shopId}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-gray-500">
                        {shop.serialNumber || index + 1}
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-800">
                        {shop.shopName} <br />
                        <span className="text-xs text-gray-500 font-normal">
                          {shop.ownerName}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={shop.rate}
                          onChange={(e) =>
                            handleRateChange(index, e.target.value)
                          }
                          className={`w-40 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 px-3 py-2 outline-none text-lg font-bold text-purple-700 bg-purple-50 ${language === "ur" ? "text-right" : "text-left"}`}
                          placeholder="0"
                        />
                      </td>
                      <td
                        className={`px-6 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {shop.rate ? (
                          <CheckCircle
                            className="text-green-500 inline"
                            size={20}
                          />
                        ) : (
                          <span className="text-red-500 text-xs">
                            {t("Pending")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyRate;
