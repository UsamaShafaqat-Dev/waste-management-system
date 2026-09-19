const User = require("../models/User");

// @desc    Register a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Sequelize mein where lagana zaroori hai
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Staff",
    });

    res.status(201).json({
      _id: user._id, // Sequelize mein humne primary key ka naam _id hi rakha hai
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
const getUsers = async (req, res) => {
  try {
    // Mongoose ke .select("-password") ki jagah Sequelize attributes exclude
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    // Agar password empty hai edit ke doran, toh usay body se nikal dein taake purana password hi rahay
    if (!req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Naya data set karein
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    await user.save(); // Yeh save chalega toh model mein rakha password hash wala hook khud trigger hoga (agar password change hua hai)

    // Response bhejne se pehle password nikal dein
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sequelize mein delete ke liye destroy() use hota hai
    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
