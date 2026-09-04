import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ==========================================
// 1. COMPONENTS & CONTEXT IMPORT SECTION
// ==========================================
import { AuthProvider } from "./context/AuthContext"; // Naya AuthContext Import Kiya Hai
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import RoutesPage from "./pages/RoutesPage";
import Shops from "./pages/Shops";
import DailyCollection from "./pages/DailyCollection";
import FactoryWeight from "./pages/FactoryWeight";
import ShopLedger from "./pages/ShopLedger";
import RouteLedger from "./pages/RouteLedger";
import MonthlyReports from "./pages/MonthlyReports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";


function App() {
  return (
    <Router>
      {/* AuthProvider ko Router ke andar wrap kiya hai */}
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          }}
        />

        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Bina login ke no access) */}
          <Route element={<ProtectedRoute />}>
            {/* Layout Wrapper (Sidebar aur Header ke liye) */}
            <Route element={<Layout />}>
              {/* ========================================== */}
              {/* 2. APP ROUTES SECTION                      */}
              {/* ========================================== */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/daily-collection" element={<DailyCollection />} />
              <Route path="/factory-weight" element={<FactoryWeight />} />
              <Route path="/shop-ledger" element={<ShopLedger />} />
              <Route path="/route-ledger" element={<RouteLedger />} />
              <Route path="/monthly-reports" element={<MonthlyReports />} />
              
              {/* Admin Only Pages (UI level par hum inko hide karenge but route mojood rahega) */}
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirect unknown routes to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;