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
import { LanguageContext } from "../context/LanguageContext"; // Zaban badalne ke liye import kiya

const DailyCollection = () => {
  const { t, language } = useContext(LanguageContext); // Translation function nikal liya

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

        const initialEntries = data.map((shop) => ({
          shopId: shop._id,
          shopName: shop.shopName,
          ratePerKg: shop.ratePerKg,
          inputWeight: "",
          unit: "KG",
          weightKg: 0,
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

  const handleWeightChange = (index, value, field) => {
    const updatedEntries = [...shopEntries];

    if (field === "weight") {
      updatedEntries[index].inputWeight = value;
    } else if (field === "unit") {
      updatedEntries[index].unit = value;
    }

    const val = parseFloat(updatedEntries[index].inputWeight) || 0;
    const isMann = updatedEntries[index].unit === "Mann";

    const computedKg = isMann ? val * 40 : val;

    updatedEntries[index].weightKg = computedKg;
    updatedEntries[index].amount = computedKg * updatedEntries[index].ratePerKg;

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
    (sum, item) => sum + (item.weightKg || 0),
    0,
  );
  const totalAmount = shopEntries.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (!selectedRoute || !date)
      return toast.error("Please select date and route");
    if (!vehicleInfo) return toast.error("No vehicle assigned to this route!");
    if (shopEntries.length === 0)
      return toast.error("No shops found in this route");

    const hasInvalidWeights = shopEntries.some(
      (item) => item.inputWeight === "" || parseFloat(item.inputWeight) < 0,
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
        collections: shopEntries,
      };

      await api.post("/daily-collections", payload);
      toast.success("Daily Collection Saved Successfully!");

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
      {/* Header */}
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

      {/* Selection Filters */}
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
          <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap">
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

      {/* Collection Data */}
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
              {/* DESKTOP VIEW (Table) */}
              <div className="hidden md:block overflow-x-auto">
                <table
                  className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  <thead>
                    <tr className="bg-gray-800 text-white text-sm">
                      <th
                        className={`px-6 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {t("Shop Name")}
                      </th>
                      <th
                        className={`px-6 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {t("Rate / KG")}
                      </th>
                      <th
                        className={`px-6 py-4 font-medium w-64 ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {t("Weight Input")}
                      </th>
                      <th
                        className={`px-6 py-4 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {t("Total Amount (Rs)")}
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
                          <div
                            className={`flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 ${language === "ur" ? "flex-row-reverse" : ""}`}
                          >
                            <input
                              id={`weight-input-${index}`}
                              type="number"
                              min="0"
                              step="any"
                              value={entry.inputWeight}
                              onChange={(e) =>
                                handleWeightChange(
                                  index,
                                  e.target.value,
                                  "weight",
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              className={`w-full px-3 py-2 outline-none ${language === "ur" ? "text-right" : "text-left"}`}
                              placeholder="0"
                            />
                            <select
                              value={entry.unit}
                              onChange={(e) =>
                                handleWeightChange(
                                  index,
                                  e.target.value,
                                  "unit",
                                )
                              }
                              className={`bg-gray-100 ${language === "ur" ? "border-r" : "border-l"} border-gray-300 px-2 py-2 outline-none font-medium text-gray-600 cursor-pointer`}
                            >
                              <option value="KG">KG</option>
                              <option value="Mann">Mann</option>
                            </select>
                          </div>
                          {entry.unit === "Mann" && entry.inputWeight && (
                            <div className="text-xs text-green-600 mt-1 font-medium">
                              {t("Calculated:")} {entry.weightKg} KG
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 font-bold text-gray-800 ${language === "ur" ? "text-left" : "text-right"}`}
                        >
                          Rs. {entry.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 border-t-2 border-green-200">
                      <td
                        colSpan="2"
                        className={`px-6 py-4 font-bold text-green-800 text-lg ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        {t("Route Total:")}
                      </td>
                      <td
                        className={`px-6 py-4 font-bold text-green-800 text-lg ${language === "ur" ? "text-right" : "text-left"}`}
                      >
                        {totalWeight} KG
                      </td>
                      <td
                        className={`px-6 py-4 font-bold text-green-800 text-lg ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        Rs. {totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* MOBILE VIEW (Cards) */}
              <div className="md:hidden p-4 space-y-4">
                {shopEntries.map((entry, index) => (
                  <div
                    key={entry.shopId}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-bold text-gray-800 text-lg">
                        {entry.shopName}
                      </span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                        {t("Rate:")} Rs. {entry.ratePerKg}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        {t("Enter Weight")}
                      </label>
                      <div
                        className={`flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 bg-white ${language === "ur" ? "flex-row-reverse" : ""}`}
                      >
                        <input
                          id={`weight-input-mobile-${index}`}
                          type="number"
                          min="0"
                          step="any"
                          value={entry.inputWeight}
                          onChange={(e) =>
                            handleWeightChange(index, e.target.value, "weight")
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className={`w-full px-3 py-2.5 outline-none text-lg ${language === "ur" ? "text-right" : "text-left"}`}
                          placeholder="0"
                        />
                        <select
                          value={entry.unit}
                          onChange={(e) =>
                            handleWeightChange(index, e.target.value, "unit")
                          }
                          className={`bg-gray-100 ${language === "ur" ? "border-r" : "border-l"} border-gray-300 px-3 py-2.5 outline-none font-bold text-gray-700 cursor-pointer h-full`}
                        >
                          <option value="KG">KG</option>
                          <option value="Mann">Mann</option>
                        </select>
                      </div>
                      {entry.unit === "Mann" && entry.inputWeight && (
                        <div className="text-xs text-green-600 font-medium text-right">
                          {t("Calculated:")} {entry.weightKg} KG
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg border-t border-green-100">
                      <span className="font-semibold text-green-800">
                        {t("Total Amount:")}
                      </span>
                      <span className="font-bold text-green-800 text-lg">
                        Rs. {entry.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Mobile Totals Card */}
                <div className="bg-gray-800 text-white rounded-lg p-4 shadow-md mt-6 space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-300 border-b border-gray-700 pb-2">
                    <span>{t("Route Total Weight:")}</span>
                    <span className="font-bold text-white text-base">
                      {totalWeight} KG
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-medium">{t("Total Payable:")}</span>
                    <span className="font-bold text-green-400 text-xl">
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="p-4 md:p-6 bg-gray-50 flex justify-end border-t border-gray-200">
                <button
                  id="save-collection-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-lg text-white font-medium transition-all w-full md:w-auto ${
                    loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  <Save size={20} />
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
