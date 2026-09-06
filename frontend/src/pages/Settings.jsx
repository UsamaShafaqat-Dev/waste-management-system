import React, { useState, useEffect, useContext } from "react";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Globe,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext"; // Hook Add Kiya

const Settings = () => {
  const { user, login } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext); // Translation Nikali
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [systemData, setSystemData] = useState({
    currency: "Rs",
    timezone: "Asia/Karachi",
    notifications: true,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, profileData);
      toast.success("Profile updated successfully!");

      const updatedUser = { ...user, name: data.name, email: data.email };
      login(updatedUser);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    setLoading(true);
    try {
      await api.put(`/users/${user._id}`, {
        password: passwordData.newPassword,
      });
      toast.success(
        "Password changed successfully! You can use it on next login.",
      );

      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("systemSettings", JSON.stringify(systemData));
      setLoading(false);
      toast.success("System preferences saved locally!");
    }, 800);
  };

  return (
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div className="p-3 bg-gray-100 text-gray-700 rounded-lg">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {t("System Settings")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Manage your account, security, and application preferences")}
          </p>
        </div>
      </div>

      <div
        className={`flex flex-col md:flex-row gap-6 ${language === "ur" ? "md:flex-row-reverse" : ""}`}
      >
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-max">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"} ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <User size={18} /> {t("My Profile")}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "security" ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"} ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Lock size={18} /> {t("Security & Password")}
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "system" ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"} ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <Globe size={18} /> {t("System Preferences")}
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2
                className={`text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <User className="text-green-600" /> {t("Personal Information")}
              </h2>
              <form
                onSubmit={handleProfileUpdate}
                className="space-y-4 max-w-lg"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("Full Name")}
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    required
                    className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("Email Address")}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    required
                    className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
                  >
                    <Save size={18} />{" "}
                    {loading ? t("Saving...") : t("Save Changes")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <h2
                className={`text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <Lock className="text-green-600" /> {t("Change Password")}
              </h2>
              <form
                onSubmit={handlePasswordUpdate}
                className="space-y-4 max-w-lg"
              >
                <p className="text-sm text-gray-500 mb-4">
                  {t("Set a new strong password for your account.")}
                </p>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("New Password")}
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength="6"
                    className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("Confirm New Password")}
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength="6"
                    className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-green-500 ${language === "ur" ? "text-right" : "text-left"}`}
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
                  >
                    <Lock size={18} />{" "}
                    {loading ? t("Updating...") : t("Update Password")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div>
              <h2
                className={`text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <Globe className="text-green-600" /> {t("System Preferences")}
              </h2>
              <form
                onSubmit={handleSystemUpdate}
                className="space-y-6 max-w-lg"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("Currency Symbol")}
                  </label>
                  <select
                    value={systemData.currency}
                    onChange={(e) =>
                      setSystemData({ ...systemData, currency: e.target.value })
                    }
                    className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-green-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
                  >
                    <option value="Rs">{t("PKR (Rs)")}</option>
                    <option value="$">{t("USD ($)")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("Timezone")}
                  </label>
                  <input
                    type="text"
                    value={systemData.timezone}
                    readOnly
                    className={`w-full border rounded-lg px-4 py-2 outline-none bg-gray-50 text-gray-500 cursor-not-allowed ${language === "ur" ? "text-right" : "text-left"}`}
                  />
                </div>

                <div
                  className={`flex items-center justify-between border-t pt-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={language === "ur" ? "text-right" : "text-left"}
                  >
                    <p
                      className={`font-medium text-gray-800 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
                    >
                      <Bell size={16} /> {t("Email Notifications")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t(
                        "Receive alerts for deleted records or large shortages.",
                      )}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemData.notifications}
                      onChange={(e) =>
                        setSystemData({
                          ...systemData,
                          notifications: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
                  >
                    <Save size={18} />{" "}
                    {loading ? t("Saving...") : t("Save Preferences")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
