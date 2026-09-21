const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// 🔥 NAYA: Import ka tareeqa thora change kiya hai
const { connectDB, sequelize } = require("./config/db");
const User = require("./models/User"); // 🔥 NAYA: User model import kiya hai taake naya account ban sake

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://waste-management-system-jx3i.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 1. ROUTES IMPORT SECTION
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
const monthlyRateRoutes = require("./routes/monthlyRateRoutes");

// ==========================================
// 2. ROUTES USAGE SECTION
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
app.use("/api/monthly-rates", monthlyRateRoutes);

// Dummy API Status Route
app.get("/api/status", (req, res) =>
  res.send("VIP Server is running securely..."),
);

// ==========================================
// 🔥 NAYA: REACT FRONTEND SERVING LOGIC
// ==========================================
// React frontend ke 'dist' folder ko serve karega
app.use(express.static(path.join(__dirname, "dist")));

// Baqi tamam routes (jo api ke nahi hain) unhe React index.html par bhej dega
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;

// 🔥 NAYA: Jab humare saare MySQL Models ban jayenge, toh hum yahan database ko sync karenge
sequelize
  .sync({ alter: false })
  .then(async () => {
    console.log("Database synced VIP Style!");

    // 🔥 JADOO: Pehla Admin user auto-create karne ki logic
    const adminEmail = "nasirshabbir.5465@gmail.com"; // 👈 Yahan apna asli email likhein
    const adminExists = await User.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: "Brotherrendringunit@#$7866", // 👈 Yahan apna asli naya password likhein
        role: "Admin",
      });
      console.log("Naya Admin User successfully create ho gaya hai!");
    }

    app.listen(PORT, () => console.log(`VIP Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("Failed to sync database: " + err.message);
  });
