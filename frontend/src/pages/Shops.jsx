import React, { useState, useEffect, useContext } from "react";
import { Store, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Shops = () => {
  const { user } = useContext(AuthContext);
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
      contact: shop.contact,
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
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="text-cyan-600" /> Shops Management
          </h1>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={18} /> Add Shop
              </>
            )}
          </button>
        )}
      </div>

      {showForm && user?.role === "Admin" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Shop" : "Add New Shop"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contact *
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Assign Route *
              </label>
              <select
                name="assignedRoute"
                value={formData.assignedRoute}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none"
              >
                <option value="">-- Select Route --</option>
                {routesList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Rate per KG (Rs.) *
              </label>
              <input
                type="number"
                name="ratePerKg"
                value={formData.ratePerKg}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save Shop"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
              <th className="px-4 py-3">Shop Name</th>
              <th className="px-4 py-3">Owner & Contact</th>
              <th className="px-4 py-3">Assigned Route</th>
              <th className="px-4 py-3">Rate/KG</th>
              <th className="px-4 py-3">Status</th>
              {user?.role === "Admin" && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {shopsList.map((shop) => (
              <tr key={shop._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="px-4 py-3 font-medium">{shop.shopName}</td>
                <td className="px-4 py-3 text-gray-600">
                  {shop.ownerName} <br />
                  <span className="text-xs text-gray-400">{shop.contact}</span>
                </td>
                <td className="px-4 py-3 font-medium text-blue-600">
                  {shop.assignedRoute
                    ? shop.assignedRoute.routeName
                    : "Not Assigned"}
                </td>
                <td className="px-4 py-3 font-semibold">
                  Rs. {shop.ratePerKg}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${shop.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {shop.status}
                  </span>
                </td>
                {user?.role === "Admin" && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="p-1 text-blue-600 mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({ show: true, id: shop._id })
                      }
                      className="p-1 text-red-600"
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
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Delete Shop?</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false })}
                  className="flex-1 py-2 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl"
                >
                  Delete
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
