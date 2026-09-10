import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔥 NAYA LOGIC: State banate waqt hi localStorage se user nikal lo taake refresh par delay na aaye
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });
  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
    navigate("/"); // Redirect to dashboard
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
