import React, { useState, useEffect, useContext } from "react";
import {
  Truck,
  Map,
  Store,
  Scale,
  Factory,
  ArrowRightLeft,
  TrendingUp,
  Filter,
  List,
  Activity,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { LanguageContext } from "../context/LanguageContext";

const Dashboard = () => {
  const { t, language } = useContext(LanguageContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedRoute, setSelectedRoute] = useState("All");
  const [routesList, setRoutesList] = useState([]);

  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalRoutes: 0,
    totalShops: 0,
    totalShopWeight: 0,
    totalFactoryWeight: 0,
    totalDifference: 0,
    routeBreakdown: [],
    recentActivity: [], // 🔥 NAYA state add kiya
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await api.get("/routes");
        setRoutesList(data);
      } catch (error) {
        console.error("Failed to load routes");
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/dashboard?date=${selectedDate}&route=${selectedRoute}`,
        );
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedDate, selectedRoute]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 md:p-6 rounded-2xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl md:text-3xl font-bold mb-2">
            {t("Welcome to Waste Management System")}
          </h1>
          <p className="text-green-50 text-sm md:text-base font-medium">
            {t("Here is what's happening today, ")}
            {new Date().toLocaleDateString(
              language === "ur" ? "ur-PK" : "en-US",
              { weekday: "long", month: "long", day: "numeric" },
            )}
          </p>
        </div>
        <div className="hidden md:block p-4 bg-white/20 rounded-xl backdrop-blur-md relative z-10">
          <TrendingUp size={36} className="text-white" />
        </div>
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div
          className={`flex items-center gap-2 mb-4 text-gray-800 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <Filter size={20} className="text-teal-600" />
          <h2 className="text-lg font-bold">{t("Filter Overview")}</h2>
        </div>
        <div
          className={`flex flex-col md:flex-row gap-4 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
        >
          <div className="flex-1">
            <label
              className={`block text-sm font-semibold text-gray-600 mb-1.5 ${language === "ur" ? "text-right" : ""}`}
            >
              {t("Select Date")}
            </label>
            <input
              type="date"
              className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none transition-all ${language === "ur" ? "text-right" : ""}`}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label
              className={`block text-sm font-semibold text-gray-600 mb-1.5 ${language === "ur" ? "text-right" : ""}`}
            >
              {t("Select Route")}
            </label>
            <select
              className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none transition-all ${language === "ur" ? "text-right" : ""}`}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="All">{t("All Routes (Overall)")}</option>
              {routesList.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Collection & Financials Totals */}
      <h2
        className={`text-lg font-bold text-gray-800 mt-8 mb-2 px-1 ${language === "ur" ? "text-right" : ""}`}
      >
        {t("Collection & Financials")}
      </h2>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
      >
        {/* Card 1 */}
        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <Scale size={28} />
          </div>
          <div
            className={`min-w-0 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <p className="text-sm font-semibold text-gray-500 truncate mb-1">
              {t("Total Shop Weight")}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalShopWeight || 0}{" "}
              <span className="text-base font-medium text-gray-400">KG</span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl shrink-0">
            <Factory size={28} />
          </div>
          <div
            className={`min-w-0 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <p className="text-sm font-semibold text-gray-500 truncate mb-1">
              {t("Total Factory Weight")}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalFactoryWeight || 0}{" "}
              <span className="text-base font-medium text-gray-400">KG</span>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`p-4 rounded-2xl shrink-0 ${(stats.totalDifference || 0) < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            <ArrowRightLeft size={28} />
          </div>
          <div
            className={`min-w-0 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <p className="text-sm font-semibold text-gray-500 truncate mb-1">
              {t("Total Difference")}
            </p>
            <p
              className={`text-2xl md:text-3xl font-bold ${(stats.totalDifference || 0) < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {loading
                ? "..."
                : stats.totalDifference > 0
                  ? `+${stats.totalDifference}`
                  : stats.totalDifference || 0}{" "}
              <span className="text-base font-medium text-gray-400">KG</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 MAIN VIP SECTION: Table and Recent Activity Side-by-Side */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 ${language === "ur" ? "lg:grid-cols-reverse" : ""}`}
      >
        {/* LEFT COLUMN: Route Breakdown Table (Takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <h2
            className={`text-lg font-bold text-gray-800 px-1 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <List size={20} className="text-teal-600" />{" "}
            {t("Route-wise Breakdown")}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse whitespace-nowrap ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th
                      className={`px-5 py-4 font-semibold ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {t("Route Name")}
                    </th>
                    <th
                      className={`px-5 py-4 font-semibold ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Shop Weight")}
                    </th>
                    <th
                      className={`px-5 py-4 font-semibold ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {t("Factory Weight")}
                    </th>
                    <th
                      className={`px-5 py-4 font-semibold ${language === "ur" ? "text-left" : "text-center"}`}
                    >
                      {t("Difference")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-gray-500 font-medium"
                      >
                        Loading details...
                      </td>
                    </tr>
                  ) : stats.routeBreakdown?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-gray-400 font-medium"
                      >
                        No records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    stats.routeBreakdown?.map((route, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors"
                      >
                        <td
                          className={`px-5 py-4 font-bold text-gray-800 ${language === "ur" ? "text-right" : "text-left"}`}
                        >
                          {route.routeName}
                        </td>
                        <td
                          className={`px-5 py-4 text-gray-600 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {route.shopWeight}{" "}
                          <span className="text-xs text-gray-400">KG</span>
                        </td>
                        <td
                          className={`px-5 py-4 font-bold text-gray-800 ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          {route.factoryWeight}{" "}
                          <span className="text-xs text-gray-400">KG</span>
                        </td>
                        <td
                          className={`px-5 py-4 ${language === "ur" ? "text-left" : "text-center"}`}
                        >
                          {/* VIP Badge for Difference */}
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${route.difference > 0 ? "bg-green-100 text-green-700" : route.difference < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {route.difference > 0 ? "+" : ""}
                            {route.difference} KG
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity Feed (Takes 1/3 width on large screens) */}
        <div className="lg:col-span-1 space-y-4">
          <h2
            className={`text-lg font-bold text-gray-800 px-1 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Activity size={20} className="text-orange-500" />{" "}
            {t("Recent Collections")}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-gray-400">
                {t("Loading...")}
              </div>
            ) : stats.recentActivity?.length === 0 ? (
              <div className="flex justify-center items-center h-40 text-gray-400 text-sm text-center">
                No recent activity found.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 pb-4 ${index !== stats.recentActivity.length - 1 ? "border-b border-gray-50" : ""} ${language === "ur" ? "flex-row-reverse text-right" : "text-left"}`}
                  >
                    <div className="mt-1 w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <Scale size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {activity.shopName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {activity.routeName}
                      </p>
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold text-teal-600 ${language === "ur" ? "flex-row-reverse" : ""}`}
                      >
                        <span>+{activity.weightKg} KG</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} />{" "}
                      {new Date(activity.date).toLocaleDateString(
                        language === "ur" ? "ur-PK" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Infrastructure Overview */}
      <h2
        className={`text-lg font-bold text-gray-800 mt-8 mb-2 px-1 ${language === "ur" ? "text-right" : ""}`}
      >
        {t("Infrastructure Overview")}
      </h2>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
      >
        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className={`${language === "ur" ? "text-right" : "text-left"}`}>
            <p className="text-sm font-semibold text-gray-500 mb-1">
              {t("Active Vehicles")}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalVehicles || 0}
            </p>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <Truck size={28} />
          </div>
        </div>

        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className={`${language === "ur" ? "text-right" : "text-left"}`}>
            <p className="text-sm font-semibold text-gray-500 mb-1">
              {t("Active Routes")}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalRoutes || 0}
            </p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <Map size={28} />
          </div>
        </div>

        <div
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className={`${language === "ur" ? "text-right" : "text-left"}`}>
            <p className="text-sm font-semibold text-gray-500 mb-1">
              {t("Registered Shops")}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalShops || 0}
            </p>
          </div>
          <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Store size={28} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
