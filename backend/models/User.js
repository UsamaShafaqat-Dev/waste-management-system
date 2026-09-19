const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    // Frontend compatibility ke liye _id
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Admin", "Staff"),
      defaultValue: "Staff",
    },
  },
  {
    timestamps: true,
    tableName: "users",
    // Password encrypt karne ke liye Hooks (Mongoose ke pre-save ki tarah)
    hooks: {
      beforeSave: async (user, options) => {
        // Agar password modifiy hua hai toh hash karein
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// Password match karne ka method (Mongoose ke methods ki tarah)
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
