import React, { useState, useEffect, useContext } from "react";
import { Map, Plus, Trash2, Edit, AlertTriangle, Loader2 } from "lucide-react"; // 🔥 NAYA: Loader2 import
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

const RoutesPage = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [routesList, setRoutesList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  // 🔥 NAYA: Delete Spinner State
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    routeName: "",
    assignedVehicle: "",
    status: "Active",
  });

  const fetchData = async () => {
    try {
      const [routesRes, vehiclesRes] = await Promise.all([
        api.get("/routes"),
        api.get("/vehicles"),
      ]);
      setRoutesList(routesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/routes/${editId}`, formData);
        toast.success("Route updated!");
      } else {
        await api.post("/routes", formData);
        toast.success("Route added!");
      }
      setFormData({ routeName: "", assignedVehicle: "", status: "Active" });
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route) => {
    setEditId(route._id);
    setFormData({
      routeName: route.routeName,
      assignedVehicle: route.assignedVehicle ? route.assignedVehicle._id : "",
      status: route.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔥 NAYA: Execute Delete with Loading Spinner
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/routes/${deleteModal.id}`);
      toast.success("Deleted successfully!");
      fetchData();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      toast.error("Error deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`space-y-6 relative ${language === "ur" ? "text-right" : "text-left"}`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div>
          <h1
            className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Map className="text-blue-600" /> {t("Routes Management")}
          </h1>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            {showForm ? (
              t("Cancel")
            ) : (
              <>
                <Plus size={18} /> {t("Add Route")}
              </>
            )}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && user?.role === "Admin" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2
            className={`text-lg font-semibold mb-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {editId ? t("Edit Route") : t("Add New Route")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Route Name *")}
              </label>
              <input
                type="text"
                name="routeName"
                value={formData.routeName}
                onChange={handleChange}
                required
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : ""}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Assign Vehicle")}
              </label>
              <select
                name="assignedVehicle"
                value={formData.assignedVehicle}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none ${language === "ur" ? "text-right" : ""}`}
              >
                <option value="">{t("-- Select --")}</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Status")}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none ${language === "ur" ? "text-right" : ""}`}
              >
                <option value="Active">{t("Active")}</option>
                <option value="Inactive">{t("Inactive")}</option>
              </select>
            </div>
            <div
              className={`md:col-span-3 flex ${language === "ur" ? "justify-start" : "justify-end"}`}
            >
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />{" "}
                    {t("Saving...")}
                  </>
                ) : (
                  t("Save")
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Data */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table
          className={`w-full border-collapse min-w-[600px] ${language === "ur" ? "text-right" : "text-left"}`}
        >
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th
                className={`px-4 py-3 font-medium w-16 ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Sr. No")}
              </th>
              <th
                className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Route Name")}
              </th>
              <th
                className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Vehicle")}
              </th>
              <th
                className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Driver")}
              </th>
              <th
                className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Status")}
              </th>
              {user?.role === "Admin" && (
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {routesList.map((route, index) => (
              <tr key={route._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="px-4 py-3 font-bold text-gray-500">
                  {index + 1}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {route.routeName}
                </td>
                <td className="px-4 py-3 font-medium text-purple-600">
                  {route.assignedVehicle
                    ? route.assignedVehicle.vehicleNumber
                    : t("Not Assigned")}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {route.assignedVehicle
                    ? route.assignedVehicle.driverName
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${route.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {t(route.status)}
                  </span>
                </td>
                {user?.role === "Admin" && (
                  <td
                    className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                  >
                    <button
                      onClick={() => handleEdit(route)}
                      className={`p-1 text-blue-600 hover:bg-blue-50 rounded ${language === "ur" ? "ml-2" : "mr-2"}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({ show: true, id: route._id })
                      }
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 NAYA: Delete Confirmation Modal With Loader */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t("Delete Route?")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "Are you sure you want to delete this route? This action cannot be undone.",
                )}
              </p>
              <div
                className={`flex gap-3 w-full mt-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2 ${isDeleting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {t("Deleting...")}
                    </>
                  ) : (
                    t("Delete")
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
export default RoutesPage;
