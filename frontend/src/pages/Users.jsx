import React, { useState, useEffect, useContext } from "react";
import {
  Users as UsersIcon,
  Plus,
  Shield,
  User,
  Trash2,
  Edit,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { LanguageContext } from "../context/LanguageContext";

const Users = () => {
  const { t, language } = useContext(LanguageContext);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [isDeleting, setIsDeleting] = useState(false);

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
      password: "",
      role: user.role,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerDelete = (id) => {
    setDeleteModal({ show: true, id });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteModal.id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", email: "", password: "", role: "Staff" });
  };

  return (
    <div
      className={`space-y-6 relative ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <div className="p-3 bg-gray-100 text-gray-700 rounded-lg">
            <UsersIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t("User Management")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("Manage Admin and restricted Staff accounts")}
            </p>
          </div>
        </div>
        <button
          onClick={showForm ? handleCancel : () => setShowForm(true)}
          className={`bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          {showForm ? (
            t("Cancel")
          ) : (
            <>
              <Plus size={18} /> {t("Add User")}
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2
            className={`text-lg font-semibold mb-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {editId ? t("Edit Account") : t("Create New Account")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Full Name *")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength="50" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500 ${language === "ur" ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Email / Username *")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength="50" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500 ${language === "ur" ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Password")}{" "}
                {editId && (
                  <span className="text-xs text-gray-400">
                    {t("(Leave empty to keep current)")}
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength="50" // 🔥 NAYA: Limit
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500 ${language === "ur" ? "text-right" : "text-left"}`}
                placeholder={editId ? "••••••••" : t("Enter password")}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("Access Role")}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-gray-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
              >
                <option value="Staff">{t("Staff (Restricted Access)")}</option>
                <option value="Admin">{t("Admin (Full Access)")}</option>
              </select>
            </div>
            <div
              className={`lg:col-span-4 flex ${language === "ur" ? "justify-start" : "justify-end"} mt-2`}
            >
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />{" "}
                    {t("Saving...")}
                  </>
                ) : editId ? (
                  t("Update Account")
                ) : (
                  t("Create Account")
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse min-w-[600px] ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                <th
                  className={`px-6 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Name")}
                </th>
                <th
                  className={`px-6 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Email / Username")}
                </th>
                <th
                  className={`px-6 py-3 font-medium ${language === "ur" ? "text-right" : "text-left"}`}
                >
                  {t("Role")}
                </th>
                <th
                  className={`px-6 py-3 font-medium ${language === "ur" ? "text-left" : "text-right"}`}
                >
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    {t("No users found.")}
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition-colors text-sm"
                  >
                    <td
                      className={`px-6 py-4 font-medium text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse justify-end" : ""}`}
                    >
                      <User size={16} className="text-gray-400" /> {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${user.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} ${language === "ur" ? "flex-row-reverse float-right" : ""}`}
                      >
                        <Shield size={12} />{" "}
                        {t(
                          user.role === "Admin"
                            ? "Admin (Full Access)"
                            : "Staff (Restricted Access)",
                        )}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 ${language === "ur" ? "text-left" : "text-right"}`}
                    >
                      <div
                        className={`flex gap-2 ${language === "ur" ? "justify-start" : "justify-end"}`}
                      >
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

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t("Delete User?")}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t(
                  "Are you sure you want to delete this user account? This action cannot be undone.",
                )}
              </p>
              <div
                className={`flex gap-3 w-full ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2 ${isDeleting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {t("Deleting...") || "Deleting..."}
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

export default Users;
