import React, { useState, useEffect, useContext } from "react";
import { Store, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext"; // Language Context

const Shops = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext); // Translation Hook

  const [shopsList, setShopsList] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    contact: "",
    address: "",
    assignedRoute: "",
    ratePerKg: "",
    status: "Active",
  });

  const fetchData = async () => {
    try {
      const [shopsRes, routesRes] = await Promise.all([
        api.get("/shops"),
        api.get("/routes"),
      ]);
      setShopsList(shopsRes.data);
      setRoutesList(routesRes.data);
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
        await api.put(`/shops/${editId}`, formData);
        toast.success("Shop updated!");
      } else {
        await api.post("/shops", formData);
        toast.success("Shop added!");
      }
      setFormData({
        shopName: "",
        ownerName: "",
        contact: "",
        address: "",
        assignedRoute: "",
        ratePerKg: "",
        status: "Active",
      });
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shop) => {
    setEditId(shop._id);
    setFormData({
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      contact: shop.contact || "",
      address: shop.address || "",
      assignedRoute: shop.assignedRoute ? shop.assignedRoute._id : "",
      ratePerKg: shop.ratePerKg,
      status: shop.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/shops/${deleteModal.id}`);
      toast.success("Deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Error deleting");
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  return (
    <div
      className={`space-y-6 relative w-full ${language === "ur" ? "text-right" : "text-left"}`}
    >
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
      >
        <div>
          <h1
            className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Store className="text-cyan-600" /> {t("Shops Management")}
          </h1>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            {showForm ? (
              t("Cancel")
            ) : (
              <>
                <Plus size={18} /> {t("Add Shop")}
              </>
            )}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && user?.role === "Admin" && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2
            className={`text-lg font-semibold mb-4 text-gray-800 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {editId ? t("Edit Shop") : t("Add New Shop")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Shop Name *")}
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Owner Name *")}
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Contact (Optional)")}
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="e.g. 0300-1234567"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Assign Route *")}
              </label>
              <select
                name="assignedRoute"
                value={formData.assignedRoute}
                onChange={handleChange}
                required
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <option value="">{t("-- Select Route --")}</option>
                {routesList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Rate per KG (Rs.) *")}
              </label>
              <input
                type="number"
                name="ratePerKg"
                min="0"
                step="any"
                value={formData.ratePerKg}
                onChange={handleChange}
                required
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
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
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <option value="Active">{t("Active")}</option>
                <option value="Inactive">{t("Inactive")}</option>
              </select>
            </div>
            <div
              className={`md:col-span-3 flex ${language === "ur" ? "justify-start" : "justify-end"} mt-2`}
            >
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-white font-medium ${loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
              >
                {loading ? t("Saving...") : t("Save Shop")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shops Data Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className={`w-full border-collapse ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <thead>
              <tr className="bg-gray-800 text-white text-sm">
                <th
                  className={`px-4 py-4 w-12 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  #
                </th>
                <th
                  className={`px-4 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Shop Name")}
                </th>
                <th
                  className={`px-4 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Owner & Contact")}
                </th>
                <th
                  className={`px-4 py-4 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Assigned Route")}
                </th>
                <th
                  className={`px-4 py-4 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Rate/KG")}
                </th>
                <th
                  className={`px-4 py-4 font-medium ${language === "ur" ? "text-left" : "text-left"}`}
                >
                  {t("Status")}
                </th>
                {user?.role === "Admin" && (
                  <th
                    className={`px-4 py-4 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                  >
                    {t("Actions")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {shopsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={user?.role === "Admin" ? 7 : 6}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("No shops found. Please add a new shop.")}
                  </td>
                </tr>
              ) : (
                shopsList.map((shop, index) => (
                  <tr
                    key={shop._id}
                    className="border-b hover:bg-gray-50 text-sm transition-colors"
                  >
                    <td
                      className={`px-4 py-3 font-bold text-gray-500 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`px-4 py-3 font-bold text-gray-800 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {shop.shopName}
                    </td>
                    <td
                      className={`px-4 py-3 text-gray-600 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {shop.ownerName} <br />
                      <span className="text-xs text-gray-500">
                        {shop.contact || "No Contact"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-medium text-blue-600 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {shop.assignedRoute
                        ? shop.assignedRoute.routeName
                        : "Not Assigned"}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold text-gray-800 ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      Rs. {shop.ratePerKg}
                    </td>
                    <td
                      className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-left"}`}
                    >
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${shop.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {t(shop.status)}
                      </span>
                    </td>
                    {user?.role === "Admin" && (
                      <td
                        className={`px-4 py-3 ${language === "ur" ? "text-left" : "text-right"}`}
                      >
                        <button
                          onClick={() => handleEdit(shop)}
                          className={`p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors ${language === "ur" ? "ml-2" : "mr-2"}`}
                          title={t("Edit")}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ show: true, id: shop._id })
                          }
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          title={t("Delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW (Cards) */}
        <div className="md:hidden flex flex-col p-4 gap-4 bg-gray-50">
          {shopsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("No shops found. Please add a new shop.")}
            </div>
          ) : (
            shopsList.map((shop, index) => (
              <div
                key={shop._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3"
              >
                <div
                  className={`flex justify-between items-start border-b border-gray-100 pb-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <div>
                    <span className="text-xs font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <h3
                      className={`font-bold text-lg text-gray-800 ${language === "ur" ? "text-right" : "text-left"}`}
                    >
                      {shop.shopName}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${shop.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {t(shop.status)}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-2 gap-2 text-sm ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`flex flex-col ${language === "ur" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-gray-500 text-xs">
                      {t("Owner & Contact")}
                    </span>
                    <span className="font-medium text-gray-800">
                      {shop.ownerName}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {shop.contact || "N/A"}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col ${language === "ur" ? "items-start" : "items-end"}`}
                  >
                    <span className="text-gray-500 text-xs">
                      {t("Assigned Route")}
                    </span>
                    <span className="font-medium text-blue-600">
                      {shop.assignedRoute
                        ? shop.assignedRoute.routeName
                        : "None"}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col mt-2 ${language === "ur" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-gray-500 text-xs">
                      {t("Rate/KG")}
                    </span>
                    <span className="font-bold text-gray-800">
                      Rs. {shop.ratePerKg}
                    </span>
                  </div>
                </div>

                {user?.role === "Admin" && (
                  <div
                    className={`flex justify-end gap-2 pt-3 border-t border-gray-100 mt-1 ${language === "ur" ? "flex-row-reverse" : ""}`}
                  >
                    <button
                      onClick={() => handleEdit(shop)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
                    >
                      <Edit size={16} /> {t("Edit")}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({ show: true, id: shop._id })
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
                    >
                      <Trash2 size={16} /> {t("Delete")}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                {t("Delete Shop?")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "Are you sure you want to delete this shop? This action cannot be undone.",
                )}
              </p>
              <div
                className={`flex gap-3 w-full ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setDeleteModal({ show: false })}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  {t("Yes, Delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;
