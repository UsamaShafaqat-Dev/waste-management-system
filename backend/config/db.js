const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load Environment Variables yahan bhi zaroori hai taake process.env mil sake
dotenv.config();

// Sequelize ka naya connection instance
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database ka naam (e.g., waste_management)
  process.env.DB_USER, // Username (e.g., root)
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST,// Host (e.g., localhost ya Hostinger ka IP)
    port: process.env.DB_PORT, 
    dialect: "mysql", // Database engine
    logging: false, // Console mein SQL queries hide karne ke liye
  },
);

const connectDB = async () => {
  try {
    // Database se connect hone ka test
    await sequelize.authenticate();
    console.log(`MySQL Connected VIP Style! 🚀 Host: ${process.env.DB_HOST}`);
  } catch (error) {
    console.error("MySQL Connection Error:", error);
    process.exit(1);
  }
};

// sequelize instance aur connectDB dono ko export kar rahe hain
module.exports = { sequelize, connectDB };
