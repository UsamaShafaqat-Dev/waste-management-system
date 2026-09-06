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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { LanguageContext } from "../context/LanguageContext"; // Language Context

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
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 md:p-6 rounded-xl shadow-md text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            {t("Welcome to Waste Management System")}
          </h1>
          <p className="text-green-100 text-sm md:text-base">
            {t("Here is what's happening today, ")}
            {new Date().toLocaleDateString(
              language === "ur" ? "ur-PK" : "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
        </div>
        <div className="hidden md:block p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <Filter size={20} />
          <h2 className="text-lg font-bold">{t("Filter Overview")}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("Select Date")}
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("Select Route")}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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

      {/* Collection & Financials */}
      <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4 px-1">
        {t("Collection & Financials")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex items-center gap-4">
          <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-full shrink-0">
            <Scale size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">
              {t("Total Shop Weight")}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalShopWeight || 0}{" "}
              <span className="text-sm md:text-lg font-normal text-gray-500">
                KG
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-orange-500 flex items-center gap-4">
          <div className="p-3 md:p-4 bg-orange-50 text-orange-600 rounded-full shrink-0">
            <Factory size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">
              {t("Total Factory Weight")}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalFactoryWeight || 0}{" "}
              <span className="text-sm md:text-lg font-normal text-gray-500">
                KG
              </span>
            </p>
          </div>
        </div>

        <div
          className={`bg-white p-5 rounded-xl shadow-sm border border-l-4 flex items-center gap-4 ${(stats.totalDifference || 0) < 0 ? "border-l-red-500" : "border-l-green-500"}`}
        >
          <div
            className={`p-3 md:p-4 rounded-full shrink-0 ${(stats.totalDifference || 0) < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            <ArrowRightLeft size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">
              {t("Total Difference")}
            </p>
            <p
              className={`text-2xl md:text-3xl font-bold ${(stats.totalDifference || 0) < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {loading ? "..." : stats.totalDifference || 0}{" "}
              <span className="text-sm md:text-lg font-normal text-gray-500">
                KG
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Overview */}
      <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4 px-1">
        {t("Infrastructure Overview")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              {t("Active Vehicles")}
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalVehicles || 0}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              {t("Active Routes")}
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalRoutes || 0}
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Map size={24} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              {t("Registered Shops")}
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : stats.totalShops || 0}
            </p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
            <Store size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
