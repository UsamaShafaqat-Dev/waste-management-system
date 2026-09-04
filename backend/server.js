const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Frontend URL
app.use(express.json()); // Allow JSON data
app.use(cookieParser()); // Fixed: Removed the spaces

// ==========================================
// 1. ROUTES IMPORT SECTION
// (Yahan saare naye routes ki files import karni hain)
// ==========================================
const vehicleRoutes = require("./routes/vehicleRoutes");
const routeRoutes = require("./routes/routeRoutes");
const shopRoutes = require("./routes/shopRoutes");
const dailyCollectionRoutes = require("./routes/dailyCollectionRoutes");
const factoryWeightRoutes = require("./routes/factoryWeightRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

// ==========================================
// 2. ROUTES USAGE SECTION
// (Yahan saare imported routes ko api path assign karna hai)
// ==========================================
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/daily-collections", dailyCollectionRoutes);
app.use("/api/factory-weights", factoryWeightRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

// Dummy API Status Route
app.get("/api/status", (req, res) =>
  res.send("VIP Server is running securely..."),
);


// ------------------------------

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VIP Server running on port ${PORT}`));
