import { useState, useContext } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext"; // Naya Context Import Kiya
import {
  Menu,
  X,
  LayoutDashboard,
  Truck,
  Map,
  Store,
  ClipboardList,
  Factory,
  BookOpen,
  Book,
  FileText,
  Users,
  Settings,
  Bell,
  LogOut,
  Leaf,
  Globe,
} from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);
  // Language Context se language aur translation function (t) nikal liya
  const { language, setLanguage, t } = useContext(LanguageContext);

  const allMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      adminOnly: true,
    },
    {
      path: "/vehicles",
      name: "Vehicles",
      icon: <Truck size={20} />,
      adminOnly: true,
    },
    {
      path: "/routes",
      name: "Routes",
      icon: <Map size={20} />,
      adminOnly: true,
    },
    {
      path: "/shops",
      name: "Shops",
      icon: <Store size={20} />,
      adminOnly: true,
    },
    {
      path: "/daily-collection",
      name: "Daily Collection",
      icon: <ClipboardList size={20} />,
      adminOnly: true,
    },
    {
      path: "/factory-weight",
      name: "Factory Weight",
      icon: <Factory size={20} />,
      adminOnly: true,
    },
    { path: "/shop-ledger", name: "Shop Ledger", icon: <BookOpen size={20} /> },
    {
      path: "/route-ledger",
      name: "Route Ledger Summary",
      icon: <Book size={20} />,
      adminOnly: true,
    },
    {
      path: "/monthly-reports",
      name: "Monthly Reports",
      icon: <FileText size={20} />,
      adminOnly: true,
    },
    {
      path: "/users",
      name: "Users",
      icon: <Users size={20} />,
      adminOnly: true,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (item.adminOnly && user?.role !== "Admin") return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}
      >
        <div className="flex items-center gap-2 p-5 border-b border-gray-800">
          <Leaf className="text-green-500" size={32} />
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">
              WASTE
            </h1>
            <p className="text-[10px] text-green-500 font-semibold tracking-widest uppercase">
              {t("Management System")}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {/* Yahan 't' function use kiya hai translation ke liye */}
                  <span className="text-sm font-medium">{t(item.name)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-4">
          <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2 text-green-400 text-xs">
            <Leaf size={16} />
            <span>{t("Keep Environment Clean")}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">{t("Logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
              {t(
                menuItems.find((item) => item.path === location.pathname)
                  ?.name || "Dashboard",
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* 🌐 LANGUAGE DROPDOWN BUTTON 🌐 */}
            <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
              <Globe size={16} className="text-gray-500 mr-2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>

            <div className="hidden md:flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            <div className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-100 rounded-lg transition border border-gray-200">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-700 leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {user?.role || "Staff"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
