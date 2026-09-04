import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);

  // Agar user logged in nahi hai, toh wapis Login page par bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Agar logged in hai, toh aage jane do
  return <Outlet />;
};

export default ProtectedRoute;
