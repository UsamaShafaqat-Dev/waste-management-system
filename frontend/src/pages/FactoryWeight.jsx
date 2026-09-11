import React, { useState, useEffect, useContext } from "react";
import {
  Factory,
  Calendar,
  Map,
  Save,
  AlertCircle,
  Edit,
  X,
  Filter,
  Download,
  Trash2, // 🔥 NAYA: Trash icon delete ke liye
  Loader2, // 🔥 NAYA: Loading spinner ke liye
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import * as XLSX from "xlsx";

const FactoryWeight = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [routes, setRoutes] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedRoute, setSelectedRoute] = useState("");

  const [totalShopWeight, setTotalShopWeight] = useState(0);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [factoryWeight, setFactoryWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [dataFound, setDataFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterRoute, setFilterRoute] = useState("");
  const [historyData, setHistoryData] = useState([]);

  const [editModal, setEditModal] = useState({ show: false, data: null });
  const [editWeight, setEditWeight] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // 🔥 NAYA: Delete Modal aur Loading State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchHistory = async () => {
    try {
      let url = `/factory-weights?month=${filterMonth}`;
      if (filterRoute) url += `&routeId=${filterRoute}`;

      const { data } = await api.get(url);
      setHistoryData(data);
    } catch (error) {
      toast.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterMonth, filterRoute]);

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
        if (error.response?.status === 404)
          toast.error("No Daily Collection found!");
      } finally {
        setFetchingData(false);
      }
    };
    fetchShopTotal();
  }, [selectedRoute, date]);

  const parsedFactoryWeight = parseFloat(factoryWeight) || 0;
  const difference = parsedFactoryWeight - totalShopWeight;

  const handleSubmit = async () => {
    if (!dataFound)
      return toast.error("Cannot save! No shop collection data found.");
    if (!factoryWeight || parsedFactoryWeight <= 0)
      return toast.error("Please enter a valid Factory Weight");

    setLoading(true);
    try {
      await api.post("/factory-weights", {
        date,
        route: selectedRoute,
        vehicle: vehicleInfo._id,
        totalShopWeight,
        factoryWeight: parsedFactoryWeight,
        notes,
      });
      toast.success("Factory Weight Saved!");
      setSelectedRoute("");
      setFactoryWeight("");
      setNotes("");
      setTotalShopWeight(0);
      setDataFound(false);
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving weight");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editWeight) return toast.error("Weight is required");
    try {
      await api.put(`/factory-weights/${editModal.data._id}`, {
        factoryWeight: parseFloat(editWeight),
        notes: editNotes,
      });
      toast.success("Record Updated!");
      setEditModal({ show: false, data: null });
      fetchHistory();
    } catch (error) {
      toast.error("Failed to update record");
    }
  };

  // 🔥 NAYA: Delete Logic with loading spinner lock
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/factory-weights/${deleteModal.id}`);
      toast.success(t("Record deleted successfully!"));
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Error deleting record"));
    } finally {
      setIsDeleting(false);
      setDeleteModal({ show: false, id: null });
    }
  };

  const exportToExcel = () => {
    if (historyData.length === 0) {
      return toast.error("No data available to download for this month!");
    }
    const excelData = historyData.map((row, index) => ({
      "#": index + 1,
      Date: new Date(row.date).toLocaleDateString(),
      "Route Name": row.route?.routeName || "N/A",
      "Shop Weight (KG)": row.totalShopWeight,
      "Factory Weight (KG)": row.factoryWeight,
      "Difference (KG)": row.difference,
      Status: row.status,
      Notes: row.notes || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factory Report");
    XLSX.writeFile(workbook, `Factory_Report_${filterMonth}.xlsx`);
  };

  return (
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1
          className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <Factory className="text-teal-600" /> {t("Factory Weight & Reports")}
        </h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2
          className={`font-bold text-gray-700 mb-4 border-b pb-2 ${language === "ur" ? "text-right" : ""}`}
        >
          {t("Record New Factory Weight")}
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${language === "ur" ? "text-right" : ""}`}
        >
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
              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${language === "ur" ? "text-right" : ""}`}
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
              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${language === "ur" ? "text-right" : ""}`}
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

        {selectedRoute && (
          <div>
            {fetchingData ? (
              <div className="text-center py-4 text-gray-500">
                {t("Loading...")}
              </div>
            ) : !dataFound ? (
              <div className="text-center py-4 text-red-500 flex flex-col items-center">
                <AlertCircle size={24} />{" "}
                {t("No collection found for this date.")}
              </div>
            ) : (
              <div className="space-y-6 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {t("Total Shop Weight")}
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {totalShopWeight} <span className="text-lg">KG</span>
                    </p>
                  </div>
                  <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-teal-700 mb-2">
                      {t("Enter Factory Weight *")}
                    </p>
                    <div
                      className={`flex items-center justify-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
                    >
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={factoryWeight}
                        onChange={(e) => setFactoryWeight(e.target.value)}
                        className={`w-32 text-center text-2xl font-bold border rounded-lg px-2 py-1 outline-none bg-white ${language === "ur" ? "text-right" : ""}`}
                        placeholder="0"
                      />
                      <span className="text-lg font-bold text-teal-800">
                        KG
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">{t("Difference")}</p>
                    <p
                      className={`text-3xl font-bold ${difference > 0 ? "text-blue-600" : difference < 0 ? "text-red-600" : "text-gray-700"}`}
                    >
                      {difference > 0 ? "+" : ""}
                      {difference} <span className="text-lg">KG</span>
                    </p>
                  </div>
                </div>
                <div
                  className={`flex flex-col md:flex-row gap-4 items-end ${language === "ur" ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="flex-1 w-full">
                    <label
                      className={`block text-sm text-gray-700 mb-1 ${language === "ur" ? "text-right" : ""}`}
                    >
                      {t("Notes (Optional)")}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 ${language === "ur" ? "text-right" : ""}`}
                      placeholder={t("Notes")}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !factoryWeight}
                    className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-teal-700 w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    <Save size={18} />{" "}
                    {loading ? t("Saving...") : t("Save Weight")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className={`p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
        >
          <h2
            className={`font-bold text-gray-700 flex items-center gap-2 w-full md:w-auto ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Filter size={18} /> {t("Monthly Factory Report")}
          </h2>

          <div
            className={`flex flex-col md:flex-row items-center gap-3 w-full md:w-auto ${language === "ur" ? "md:flex-row-reverse" : ""}`}
          >
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm w-full md:w-auto bg-white"
            >
              <option value="">{t("All Routes")}</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeName}
                </option>
              ))}
            </select>

            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
            />
            <button
              onClick={exportToExcel}
              className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Download size={16} /> {t("Excel File")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse whitespace-nowrap ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <thead>
              <tr className="bg-gray-800 text-white text-sm">
                <th className="px-4 py-3 w-12 text-center font-medium">#</th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Date")}
                </th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Route")}
                </th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Shop Wgt")}
                </th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Factory Wgt")}
                </th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Diff")}
                </th>
                <th
                  className={`px-4 py-3 ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Status / Notes")}
                </th>
                {user?.role === "Admin" && (
                  <th className="px-4 py-3 text-center">{t("Actions")}</th> // 🔥 Title Changed
                )}
              </tr>
            </thead>
            <tbody>
              {historyData.length === 0 ? (
                <tr>
                  <td
                    colSpan={user?.role === "Admin" ? 8 : 7}
                    className="text-center py-6 text-gray-500"
                  >
                    {t("No factory records found for this month.")}
                  </td>
                </tr>
              ) : (
                historyData.map((row, index) => (
                  <tr
                    key={row._id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="px-4 py-3 text-center font-bold text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-teal-700">
                      {row.route?.routeName}
                    </td>
                    <td
                      className={`px-4 py-3 text-gray-600 ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {row.totalShopWeight} KG
                    </td>
                    <td
                      className={`px-4 py-3 font-bold text-gray-800 ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {row.factoryWeight} KG
                    </td>
                    <td
                      className={`px-4 py-3 font-bold ${row.difference > 0 ? "text-blue-600" : row.difference < 0 ? "text-red-600" : ""} ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      {row.difference > 0 ? "+" : ""}
                      {row.difference} KG
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${row.status === "Extra" ? "bg-blue-100 text-blue-700" : row.status === "Shortage" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {t(row.status)}
                      </span>
                      {row.notes && (
                        <div
                          className="text-xs text-gray-500 mt-1 max-w-[200px] truncate"
                          title={row.notes}
                        >
                          {row.notes}
                        </div>
                      )}
                    </td>
                    {user?.role === "Admin" && (
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`flex justify-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
                        >
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditModal({ show: true, data: row });
                              setEditWeight(row.factoryWeight);
                              setEditNotes(row.notes || "");
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition"
                            title={t("Edit")}
                          >
                            <Edit size={16} />
                          </button>

                          {/* 🔥 NAYA: Delete Button */}
                          <button
                            onClick={() =>
                              setDeleteModal({ show: true, id: row._id })
                            }
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                            title={t("Delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div
              className={`flex justify-between items-center mb-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <h3 className="font-bold text-lg">{t("Edit Factory Weight")}</h3>
              <button
                onClick={() => setEditModal({ show: false, data: null })}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div
                className={`bg-gray-100 p-3 rounded-lg text-sm text-gray-600 flex justify-between ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <span>{t("Shop Weight:")}</span>
                <span className="font-bold">
                  {editModal.data.totalShopWeight} KG
                </span>
              </div>
              <div>
                <label
                  className={`block text-sm text-gray-700 mb-1 ${language === "ur" ? "text-right" : ""}`}
                >
                  {t("New Factory Weight (KG)")}
                </label>
                <input
                  type="number"
                  step="any"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 ${language === "ur" ? "text-right" : ""}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm text-gray-700 mb-1 ${language === "ur" ? "text-right" : ""}`}
                >
                  {t("Notes")}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 ${language === "ur" ? "text-right" : ""}`}
                />
              </div>
              <button
                onClick={handleEditSubmit}
                className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 mt-2"
              >
                {t("Update Record")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 NAYA: Delete Confirmation Modal with Loader */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                {t("Delete Record?")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "Are you sure you want to delete this factory weight? This action cannot be undone.",
                )}
              </p>
              <div
                className={`flex gap-3 w-full ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className={`flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm flex justify-center items-center gap-2 ${isDeleting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {t("Deleting...")}
                    </>
                  ) : (
                    t("Yes, Delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryWeight;
