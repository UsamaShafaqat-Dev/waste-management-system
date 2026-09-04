import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Plus,
  Shield,
  User,
  Trash2,
  Edit,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsersList(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create ke time password zaroori hai, Edit ke time optional hai
    if (!editId && (!formData.name || !formData.email || !formData.password)) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    try {
      if (editId) {
        await api.put(`/users/${editId}`, formData);
        toast.success("User updated successfully!");
      } else {
        await api.post("/users", formData);
        toast.success("User account created successfully!");
      }

      setFormData({ name: "", email: "", password: "", role: "Staff" });
      setEditId(null);
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Password intentionally empty for security
      role: user.role,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerDelete = (id) => {
    setDeleteModal({ show: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/users/${deleteModal.id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting user");
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", email: "", password: "", role: "Staff" });
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 text-gray-700 rounded-lg">
            <UsersIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">
              Manage Admin and restricted Staff accounts
            </p>
          </div>
        </div>
        <button
          onClick={showForm ? handleCancel : () => setShowForm(true)}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus size={18} /> Add User
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Account" : "Create New Account"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email / Username *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password{" "}
                {editId && (
                  <span className="text-xs text-gray-400">
                    (Leave empty to keep current)
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500"
                placeholder={editId ? "••••••••" : "Enter password"}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Access Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500"
              >
                <option value="Staff">Staff (Restricted Access)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading
                  ? "Saving..."
                  : editId
                    ? "Update Account"
                    : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email / Username</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                      <User size={16} className="text-gray-400" /> {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${user.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => triggerDelete(user._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIP Custom Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete User?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this user account? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
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

export default Users;
