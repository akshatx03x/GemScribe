import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/* =========================
   Helper: Generate JWT
========================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* =========================
   Manual Login
========================= */
export const manualLogin = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: fullName,
        email,
        password: hashedPassword,
        provider: "manual",
        avatar: "https://example.com/default-avatar.png",
      });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,        // ✅ REQUIRED
        sameSite: "none",    // ✅ REQUIRED
      })
      .status(200)
      .json({ success: true, user, token });

  } catch (error) {
    console.error("Manual login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   Google / GitHub Login
========================= */
export const login = async (req, res) => {
  try {
    const { name, email, phoneNumber, avatar, provider, githubToken, password } = req.body;

    let user = await User.findOne({ email }).select(
      provider === "manual" ? "+password +githubToken" : "+githubToken"
    );

    if (!user) {
      if (provider === "manual") {
        if (!password) {
          return res.status(400).json({ message: "Password is required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          name,
          email,
          phoneNumber,
          avatar: avatar || "https://example.com/default-avatar.png",
          provider: "manual",
          password: hashedPassword,
          githubToken: null,
        });
      } else {
        user = await User.create({
          name,
          email,
          phoneNumber,
          avatar: avatar || "https://example.com/default-avatar.png",
          provider: provider || "google",
          githubToken: githubToken || null,
        });
      }
    } else {
      if (provider === "manual") {
        if (!password) {
          return res.status(400).json({ message: "Password is required" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
      } else if (githubToken) {
        user.githubToken = githubToken;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // ✅ REQUIRED
      sameSite: "none",    // ✅ REQUIRED
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   Get Logged-in User
========================= */
export const getUser = async (req, res) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+githubToken");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        hasGithubToken: !!user.githubToken,
      },
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   Logout
========================= */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   Get GitHub Repos
========================= */
export const getRepos = async (req, res) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+githubToken");

    if (!user || !user.githubToken) {
      return res.status(400).json({
        success: false,
        message: "No GitHub token available. Please log in with GitHub.",
      });
    }

    const response = await fetch("https://api.github.com/user/repos?type=all", {
      headers: {
        Authorization: `token ${user.githubToken}`,
      },
    });

    const repos = await response.json();

    res.status(200).json({
      success: true,
      repos: repos.map((repo) => ({
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        url: repo.html_url,
      })),
    });

  } catch (error) {
    console.error("Error fetching repos:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
