import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { Resend } from "resend";


dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ REGISTER USER
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ FORGOT PASSWORD (Send Reset Link)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    // 2️⃣ Generate reset token and link
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // expires in 15 mins
    await user.save();

    // 3️⃣ Setup Resend SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY, // your Resend API key
      },
    });

    // 4️⃣ Email content
    const mailOptions = {
      from: "sanjanabaskar05@gmail.com", // ✅ your Gmail address
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.username || "there"},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetLink}" style="color:blue;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    // 5️⃣ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("💥 Error in forgotPassword:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// ✅ RESET PASSWORD (Update in DB)
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful! Please log in." });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
