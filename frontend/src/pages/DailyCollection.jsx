import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Calendar,
  Map,
  Truck,
  Save,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const DailyCollection = () => {
  const [routes, setRoutes] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Today's date default
  const [selectedRoute, setSelectedRoute] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [shopEntries, setShopEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShops, setFetchingShops] = useState(false);

  // 1. Fetch Routes on Component Mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await api.get("/routes");
        // Only active routes
        setRoutes(data.filter((r) => r.status === "Active"));
      } catch (error) {
        toast.error("Failed to fetch routes");
      }
    };
    fetchRoutes();
  }, []);

  // 2. Fetch Shops when Route Changes
  useEffect(() => {
    if (!selectedRoute) {
      setShopEntries([]);
      setVehicleInfo(null);
      return;
    }

    const fetchShopsForRoute = async () => {
      setFetchingShops(true);
      try {
        // Find assigned vehicle from the loaded routes array
        const routeDetail = routes.find((r) => r._id === selectedRoute);
        setVehicleInfo(routeDetail?.assignedVehicle || null);

        // Fetch shops for this specific route
        const { data } = await api.get(
          `/daily-collections/shops/${selectedRoute}`,
        );

        // Setup initial table data state for input fields
        const initialEntries = data.map((shop) => ({
          shopId: shop._id,
          shopName: shop.shopName,
          ratePerKg: shop.ratePerKg,
          weightKg: "", // Empty initially for user input
          amount: 0,
        }));

        setShopEntries(initialEntries);
      } catch (error) {
        toast.error("Failed to fetch shops for this route");
      } finally {
        setFetchingShops(false);
      }
    };

    fetchShopsForRoute();
  }, [selectedRoute, routes]);

  // 3. Handle Weight Input & Auto Calculation[cite: 1]
  const handleWeightChange = (index, value) => {
    const updatedEntries = [...shopEntries];
    const weight = parseFloat(value) || 0;

    updatedEntries[index].weightKg = value; // string for input field
    updatedEntries[index].amount = weight * updatedEntries[index].ratePerKg; // Auto calculate

    setShopEntries(updatedEntries);
  };

  // 4. Calculate Totals[cite: 1]
  const totalWeight = shopEntries.reduce(
    (sum, item) => sum + (parseFloat(item.weightKg) || 0),
    0,
  );
  const totalAmount = shopEntries.reduce((sum, item) => sum + item.amount, 0);

  // 5. Submit Data[cite: 1]
  const handleSubmit = async () => {
    // Validation
    if (!selectedRoute || !date)
      return toast.error("Please select date and route");
    if (!vehicleInfo) return toast.error("No vehicle assigned to this route!");
    if (shopEntries.length === 0)
      return toast.error("No shops found in this route");

    // Check if any weight is missing
    const hasEmptyWeights = shopEntries.some(
      (item) => item.weightKg === "" || parseFloat(item.weightKg) <= 0,
    );
    if (hasEmptyWeights) {
      return toast.error("Please enter valid weight for all shops");
    }

    setLoading(true);
    try {
      const payload = {
        date,
        routeId: selectedRoute,
        vehicleId: vehicleInfo._id,
        collections: shopEntries,
      };

      await api.post("/daily-collections", payload);
      toast.success("Daily Collection Saved Successfully!");

      // Reset form on success
      setSelectedRoute("");
      setShopEntries([]);
      setVehicleInfo(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-green-600" /> Daily Shop Collection /
          Weight Entry
        </h1>
        <p className="text-sm text-gray-500">
          Record daily poultry waste collection from shops
        </p>
      </div>

      {/* Selection Filters (Date & Route)[cite: 1] */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} /> Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Map size={16} /> Select Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select Route --</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        {/* Display Auto-Assigned Vehicle[cite: 1] */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Truck size={16} /> Assigned Vehicle
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5">
            {selectedRoute ? (
              vehicleInfo ? (
                `${vehicleInfo.vehicleNumber} (${vehicleInfo.driverName})`
              ) : (
                <span className="text-red-500">No Vehicle Assigned!</span>
              )
            ) : (
              "Select a route first"
            )}
          </div>
        </div>
      </div>

      {/* Collection Table[cite: 1] */}
      {selectedRoute && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {fetchingShops ? (
            <div className="p-8 text-center text-gray-500">
              Loading shops...
            </div>
          ) : shopEntries.length === 0 ? (
            <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle size={32} />
              <p>
                No shops are assigned to this route. Please add shops first.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white text-sm">
                      <th className="px-6 py-4 font-medium">Shop Name</th>
                      <th className="px-6 py-4 font-medium">Rate / KG</th>
                      <th className="px-6 py-4 font-medium w-48">
                        Weight (KG)
                      </th>
                      <th className="px-6 py-4 font-medium text-right">
                        Total Amount (Rs)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopEntries.map((entry, index) => (
                      <tr
                        key={entry.shopId}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {entry.shopName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          Rs. {entry.ratePerKg}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.weightKg}
                            onChange={(e) =>
                              handleWeightChange(index, e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="0 KG"
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          Rs. {entry.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Footer Totals Row */}
                  <tfoot>
                    <tr className="bg-green-50 border-t-2 border-green-200">
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-right font-bold text-green-800 text-lg"
                      >
                        Route Total:
                      </td>
                      <td className="px-6 py-4 font-bold text-green-800 text-lg">
                        {totalWeight} KG
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-800 text-lg">
                        Rs. {totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Save Button */}
              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition-all ${
                    loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  <Save size={20} />
                  {loading ? "Saving Collection..." : "Save Daily Collection"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyCollection;
