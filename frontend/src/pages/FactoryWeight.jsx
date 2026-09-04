import React, { useState, useEffect } from "react";
import { Factory, Calendar, Map, Scale, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const FactoryWeight = () => {
  const [routes, setRoutes] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedRoute, setSelectedRoute] = useState("");

  // Data States
  const [totalShopWeight, setTotalShopWeight] = useState(0);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [factoryWeight, setFactoryWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Status States
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [dataFound, setDataFound] = useState(false);

  // 1. Fetch Routes on Component Mount
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

  // 2. Fetch Total Shop Weight when Date or Route changes
  useEffect(() => {
    if (!selectedRoute || !date) {
      setTotalShopWeight(0);
      setVehicleInfo(null);
      setDataFound(false);
      return;
    }

    const fetchShopTotal = async () => {
      setFetchingData(true);
      try {
        const { data } = await api.get(
          `/factory-weights/shop-total?date=${date}&routeId=${selectedRoute}`,
        );
        setTotalShopWeight(data.totalShopWeight);
        setVehicleInfo(data.vehicle);
        setDataFound(true);
      } catch (error) {
        setTotalShopWeight(0);
        setVehicleInfo(null);
        setDataFound(false);
        if (error.response?.status === 404) {
          toast.error(
            "No Daily Collection found for this Route on selected Date!",
          );
        } else {
          toast.error("Error fetching shop weight data");
        }
      } finally {
        setFetchingData(false);
      }
    };

    fetchShopTotal();
  }, [selectedRoute, date]);

  // 3. Auto Calculate Difference
  const parsedFactoryWeight = parseFloat(factoryWeight) || 0;
  const difference = parsedFactoryWeight - totalShopWeight;
  let status = "Balanced";
  let statusColor = "text-gray-600 bg-gray-100";

  if (difference > 0) {
    status = "Extra";
    statusColor = "text-blue-600 bg-blue-100";
  } else if (difference < 0) {
    status = "Shortage";
    statusColor = "text-red-600 bg-red-100";
  }

  // 4. Submit Data
  const handleSubmit = async () => {
    if (!dataFound)
      return toast.error("Cannot save! No shop collection data found.");
    if (!factoryWeight || parsedFactoryWeight <= 0)
      return toast.error("Please enter a valid Factory Weight");

    setLoading(true);
    try {
      const payload = {
        date,
        route: selectedRoute,
        vehicle: vehicleInfo._id,
        totalShopWeight,
        factoryWeight: parsedFactoryWeight,
        notes,
      };

      await api.post("/factory-weights", payload);
      toast.success("Factory Weight Saved Successfully!");

      // Reset Form
      setSelectedRoute("");
      setFactoryWeight("");
      setNotes("");
      setTotalShopWeight(0);
      setDataFound(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error saving factory weight",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Factory className="text-teal-600" /> Factory Weight Entry
        </h1>
        <p className="text-sm text-gray-500">
          Record factory weight and calculate collection differences
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} /> Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Map size={16} /> Select Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- Select Route --</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form Area */}
      {selectedRoute && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {fetchingData ? (
            <div className="text-center py-8 text-gray-500">
              Loading collection data...
            </div>
          ) : !dataFound ? (
            <div className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
              <AlertCircle size={32} />
              <p>
                No Daily Collection found for this Route on the selected date.
              </p>
              <p className="text-sm text-gray-400">
                Please complete the Daily Shop Collection first.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Weight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Shop Weight (Read Only) */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Shop Weight
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalShopWeight} <span className="text-lg">KG</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Fetched from Daily Collection
                  </p>
                </div>

                {/* Factory Weight (Input) */}
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 text-center relative">
                  <p className="text-sm font-medium text-teal-700 mb-2">
                    Enter Factory Weight *
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={factoryWeight}
                      onChange={(e) => setFactoryWeight(e.target.value)}
                      className="w-32 text-center text-2xl font-bold border border-teal-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      placeholder="0"
                    />
                    <span className="text-lg font-bold text-teal-800">KG</span>
                  </div>
                </div>

                {/* Difference (Auto Calculated) */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Difference
                  </p>
                  <p
                    className={`text-3xl font-bold ${difference > 0 ? "text-blue-600" : difference < 0 ? "text-red-600" : "text-gray-700"}`}
                  >
                    {difference > 0 ? "+" : ""}
                    {difference} <span className="text-lg">KG</span>
                  </p>
                  <span
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Notes & Submit */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                  placeholder="Any reason for shortage/extra weight..."
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !factoryWeight}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition-all ${
                      loading || !factoryWeight
                        ? "bg-teal-400 cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <Save size={20} />
                    {loading ? "Saving..." : "Save Factory Weight"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FactoryWeight;
