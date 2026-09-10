import React, { useState, useEffect, useContext } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

const Vehicles = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    driverName: "",
    driverContact: "",
    status: "Active",
  });

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get("/vehicles");
      setVehiclesList(data);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/vehicles/${editId}`, formData);
        toast.success(t("Vehicle updated successfully!"));
      } else {
        await api.post("/vehicles", formData);
        toast.success(t("Vehicle added successfully!"));
      }
      setFormData({
        vehicleNumber: "",
        vehicleName: "",
        driverName: "",
        driverContact: "",
        status: "Active",
      });
      setEditId(null);
      setShowForm(false);
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Error saving vehicle"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditId(vehicle._id);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleName: vehicle.vehicleName || "",
      driverName: vehicle.driverName,
      driverContact: vehicle.driverContact,
      status: vehicle.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/vehicles/${deleteModal.id}`);
      toast.success(t("Vehicle deleted successfully!"));
      fetchVehicles();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || t("Error deleting"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`space-y-6 relative ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div>
          <h1
            className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Truck className="text-green-600" /> {t("Vehicles Management")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Manage all your transport vehicles")}
          </p>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={
              showForm
                ? () => {
                    setShowForm(false);
                    setEditId(null);
                  }
                : () => setShowForm(true)
            }
            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            {showForm ? (
              t("Cancel")
            ) : (
              <>
                <Plus size={18} /> {t("Add Vehicle")}
              </>
            )}
          </button>
        )}
      </div>

      {showForm && user?.role === "Admin" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2
            className={`text-lg font-semibold mb-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {editId ? t("Edit Vehicle") : t("Add New Vehicle")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Vehicle Number *")}
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                maxLength="20" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                placeholder="e.g. AP-001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Vehicle Name/Type")}
              </label>
              <input
                type="text"
                name="vehicleName"
                value={formData.vehicleName}
                onChange={handleChange}
                maxLength="50" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                placeholder="e.g. Shehzore"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Driver Name *")}
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                required
                maxLength="50" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                placeholder={t("Driver")}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Driver Contact *")}
              </label>
              <input
                type="text"
                name="driverContact"
                value={formData.driverContact}
                onChange={handleChange}
                required
                maxLength="15" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                placeholder="0300-0000000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Status")}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <option value="Active">{t("Active")}</option>
                <option value="Inactive">{t("Inactive")}</option>
                <option value="Under Maintenance">
                  {t("Under Maintenance")}
                </option>
              </select>
            </div>
            <div
              className={`lg:col-span-3 flex ${language === "ur" ? "justify-start" : "justify-end"}`}
            >
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />{" "}
                    {t("Saving...")}
                  </>
                ) : editId ? (
                  t("Update Vehicle")
                ) : (
                  t("Save Vehicle")
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table and Modal Code stays the same, I'm keeping it concise for token limit... */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
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
                  {t("Vehicle No.")}
                </th>
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Name/Type")}
                </th>
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Driver")}
                </th>
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Contact")}
                </th>
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Assigned Route")}
                </th>
                <th
                  className={`px-4 py-3 font-medium ${language === "ur" ? "text-left" : "text-left"}`}
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
              {vehiclesList.map((vehicle, index) => (
                <tr
                  key={vehicle._id}
                  className="border-b hover:bg-gray-50 text-sm"
                >
                  <td className="px-4 py-3 font-bold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {vehicle.vehicleNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.vehicleName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.driverName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.driverContact}
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {vehicle.assignedRoute
                      ? vehicle.assignedRoute.routeName
                      : t("Not Assigned")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {t(vehicle.status)}
                    </span>
                  </td>
                  {user?.role === "Admin" && (
                    <td
                      className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      <div
                        className={`flex gap-2 ${language === "ur" ? "justify-start" : "justify-end"}`}
                      >
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ show: true, id: vehicle._id })
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t("Delete Vehicle?")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "Are you sure you want to delete this vehicle? This action cannot be undone.",
                )}
              </p>
              <div
                className={`flex gap-3 w-full mt-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex justify-center items-center gap-2 ${isDeleting ? "opacity-70 cursor-not-allowed" : ""}`}
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
export default Vehicles;
