import React, { useState, useEffect } from "react";
import { Truck, Map, Store, Scale, Banknote, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalRoutes: 0,
    totalShops: 0,
    todayWeight: 0,
    todayAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>
    );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl shadow-md text-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome to Waste Management System
          </h1>
          <p className="text-green-100">
            Here is what's happening today,{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="hidden md:block p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
      </div>

      {/* Today's Highlights */}
      <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">
        Today's Collection Highlights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Scale size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Today's Total Weight
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.todayWeight}{" "}
              <span className="text-lg font-normal text-gray-500">KG</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <Banknote size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Today's Payable Amount
            </p>
            <p className="text-3xl font-bold text-gray-800">
              <span className="text-lg font-normal text-gray-500">Rs.</span>{" "}
              {stats.todayAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Overview */}
      <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">
        Infrastructure Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Active Vehicles
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalVehicles}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Active Routes
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalRoutes}
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Map size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Registered Shops
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalShops}
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
