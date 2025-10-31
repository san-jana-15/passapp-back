import User from "../models/User.js";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("📩 Forgot password request for:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("🔗 Reset link:", resetLink);

    // Send email via Resend
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ works for testing
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    console.log("✅ Resend email sent:", data);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("💥 Error in forgotPassword:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
