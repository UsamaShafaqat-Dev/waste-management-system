import React, { useState, useEffect, useContext } from "react";
import { Truck, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Vehicles = () => {
  const { user } = useContext(AuthContext); // User details li hain
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

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
        toast.success("Vehicle updated successfully!");
      } else {
        await api.post("/vehicles", formData);
        toast.success("Vehicle added successfully!");
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
      toast.error(error.response?.data?.message || "Error saving vehicle");
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
    try {
      await api.delete(`/vehicles/${deleteModal.id}`);
      toast.success("Vehicle deleted successfully!");
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting");
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-green-600" /> Vehicles Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage all your transport vehicles
          </p>
        </div>
        {/* ADD BUTTON - ONLY FOR ADMIN */}
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={18} /> Add Vehicle
              </>
            )}
          </button>
        )}
      </div>

      {showForm && user?.role === "Admin" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500"
                placeholder="e.g. AP-001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Vehicle Name/Type
              </label>
              <input
                type="text"
                name="vehicleName"
                value={formData.vehicleName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500"
                placeholder="e.g. Shehzore"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Driver Name *
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500"
                placeholder="Driver Name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Driver Contact *
              </label>
              <input
                type="text"
                name="driverContact"
                value={formData.driverContact}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500"
                placeholder="0300-0000000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-green-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div className="lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading
                  ? "Saving..."
                  : editId
                    ? "Update Vehicle"
                    : "Save Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                <th className="px-4 py-3 font-medium">Vehicle No.</th>
                <th className="px-4 py-3 font-medium">Name/Type</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Assigned Route</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {/* ACTION HEADER - ONLY FOR ADMIN */}
                {user?.role === "Admin" && (
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {vehiclesList.map((vehicle) => (
                <tr
                  key={vehicle._id}
                  className="border-b hover:bg-gray-50 text-sm"
                >
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
                      : "Not Assigned"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {vehicle.status}
                    </span>
                  </td>

                  {/* ACTIONS - ONLY FOR ADMIN */}
                  {user?.role === "Admin" && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
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
                Delete Vehicle?
              </h3>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  Yes, Delete
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
