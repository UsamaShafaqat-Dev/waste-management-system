import React, { useState, useEffect, useContext } from "react";
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
import { LanguageContext } from "../context/LanguageContext";

const DailyCollection = () => {
  const { t, language } = useContext(LanguageContext);

  const [routes, setRoutes] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [shopEntries, setShopEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShops, setFetchingShops] = useState(false);

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
    if (!selectedRoute) {
      setShopEntries([]);
      setVehicleInfo(null);
      return;
    }

    const fetchShopsForRoute = async () => {
      setFetchingShops(true);
      try {
        const routeDetail = routes.find((r) => r._id === selectedRoute);
        setVehicleInfo(routeDetail?.assignedVehicle || null);

        const { data } = await api.get(
          `/daily-collections/shops/${selectedRoute}`,
        );

        // 🔥 Rate aur Mann khatam, Sirf Weight (KG) bacha hai
        const initialEntries = data.map((shop) => ({
          shopId: shop._id,
          shopName: shop.shopName,
          weightKg: "",
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

  const handleWeightChange = (index, value) => {
    const updatedEntries = [...shopEntries];
    updatedEntries[index].weightKg = value;
    setShopEntries(updatedEntries);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let nextInput = document.getElementById(`weight-input-${index + 1}`);
      if (!nextInput) {
        nextInput = document.getElementById(`weight-input-mobile-${index + 1}`);
      }

      if (nextInput) {
        nextInput.focus();
      } else {
        document.getElementById("save-collection-btn")?.focus();
      }
    }
  };

  const totalWeight = shopEntries.reduce(
    (sum, item) => sum + (parseFloat(item.weightKg) || 0),
    0,
  );

  const handleSubmit = async () => {
    if (!selectedRoute || !date)
      return toast.error(t("Please select date and route"));
    if (!vehicleInfo) return toast.error(t("No Vehicle!"));
    if (shopEntries.length === 0)
      return toast.error(t("No shops found in this route"));

    const hasInvalidWeights = shopEntries.some(
      (item) => item.weightKg === "" || parseFloat(item.weightKg) < 0,
    );
    if (hasInvalidWeights) {
      return toast.error(
        "Please enter a valid weight (0 or more) for all shops",
      );
    }

    setLoading(true);
    try {
      const payload = {
        date,
        routeId: selectedRoute,
        vehicleId: vehicleInfo._id,
        collections: shopEntries.map((entry) => ({
          shopId: entry.shopId,
          weightKg: parseFloat(entry.weightKg),
        })),
      };

      await api.post("/daily-collections", payload);
      toast.success(t("Save Daily Collection"));

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
    <div
      className={`space-y-6 w-full ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1
          className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
        >
          <ClipboardList className="text-green-600" />{" "}
          {t("Daily Shop Collection / Weight Entry")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("Record daily poultry waste collection from shops")}
        </p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Calendar size={16} /> {t("Select Date")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 ${language === "ur" ? "text-right" : ""}`}
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
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 ${language === "ur" ? "text-right" : ""}`}
          >
            <option value="">{t("-- Select Route --")}</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
          >
            <Truck size={16} /> {t("Assigned Vehicle")}
          </label>
          <div
            className={`w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap ${language === "ur" ? "text-right" : ""}`}
          >
            {selectedRoute ? (
              vehicleInfo ? (
                `${vehicleInfo.vehicleNumber} (${vehicleInfo.driverName})`
              ) : (
                <span className="text-red-500">{t("No Vehicle!")}</span>
              )
            ) : (
              t("Select Route")
            )}
          </div>
        </div>
      </div>

      {selectedRoute && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {fetchingShops ? (
            <div className="p-8 text-center text-gray-500">
              {t("Loading shops...")}
            </div>
          ) : shopEntries.length === 0 ? (
            <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle size={32} />
              <p>
                {t(
                  "No shops are assigned to this route. Please add shops first.",
                )}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table
                  className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  <thead>
                    <tr className="bg-gray-800 text-white text-sm">
                      <th
                        className={`px-6 py-4 font-medium w-1/2 ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {t("Shop Name")}
                      </th>
                      <th
                        className={`px-6 py-4 font-medium w-1/2 ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {t("Weight (KG)")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopEntries.map((entry, index) => (
                      <tr
                        key={entry.shopId}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800 text-lg">
                          {entry.shopName}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            id={`weight-input-${index}`}
                            type="number"
                            min="0"
                            step="any"
                            value={entry.weightKg}
                            onChange={(e) =>
                              handleWeightChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-full border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 px-4 py-3 outline-none text-xl font-medium text-blue-700 bg-blue-50 ${language === "ur" ? "text-right" : "text-left"}`}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 border-t-2 border-green-200">
                      <td
                        className={`px-6 py-4 font-bold text-green-800 text-xl ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {t("Route Total Weight:")}
                      </td>
                      <td
                        className={`px-6 py-4 font-black text-green-800 text-2xl ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {totalWeight} KG
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {shopEntries.map((entry, index) => (
                  <div
                    key={entry.shopId}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span
                        className={`font-bold text-gray-800 text-xl ${language === "ur" ? "text-right w-full" : ""}`}
                      >
                        {entry.shopName}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-xs font-semibold text-gray-500 uppercase block ${language === "ur" ? "text-right" : ""}`}
                      >
                        {t("Enter Weight (KG)")}
                      </label>
                      <input
                        id={`weight-input-mobile-${index}`}
                        type="number"
                        min="0"
                        step="any"
                        value={entry.weightKg}
                        onChange={(e) =>
                          handleWeightChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-full border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 px-4 py-3 outline-none text-2xl font-bold text-blue-700 bg-blue-50 ${language === "ur" ? "text-right" : "text-left"}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
                <div className="bg-gray-800 text-white rounded-lg p-5 shadow-md mt-6">
                  <div
                    className={`flex justify-between items-center text-sm border-gray-700 ${language === "ur" ? "flex-row-reverse" : ""}`}
                  >
                    <span className="font-medium text-lg">
                      {t("Route Total Weight:")}
                    </span>
                    <span className="font-black text-green-400 text-2xl">
                      {totalWeight} KG
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 md:p-6 bg-gray-50 flex border-t border-gray-200 ${language === "ur" ? "justify-start" : "justify-end"}`}
              >
                <button
                  id="save-collection-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 rounded-lg text-white font-bold transition-all w-full md:w-auto text-lg ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-md"} ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <Save size={24} />
                  {loading
                    ? t("Saving Collection...")
                    : t("Save Daily Collection")}
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
