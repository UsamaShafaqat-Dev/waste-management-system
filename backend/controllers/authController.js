const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Security package add kar diya

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecret123", {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      let isMatch = false;

      // Smart Check: Agar password hash hai (lamaba code), toh bcrypt se check karo
      if (user.password.startsWith("$2")) {
        isMatch = await bcrypt.compare(password, user.password);
      }
      // Agar password plain text hai (jaise admin ka 123456), toh direct match karo
      else {
        isMatch = password === user.password;
      }

      // Agar password theek hai toh Login karwa do
      if (isMatch) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
        return; // Yahan se code wapas bhej do taake aage error na aaye
      }
    }

    // Agar email ya password ghalat ho
    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser };
