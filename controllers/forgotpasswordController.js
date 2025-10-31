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

    // Generate and save reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("🔗 Reset link:", resetLink);

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: "PassApp <onboarding@resend.dev>", // or your verified domain sender
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:sans-serif;line-height:1.6;">
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
          <p>If you didn’t request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return res.status(500).json({ message: "Failed to send reset email." });
    }

    console.log("✅ Email sent via Resend:", data);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("💥 Error in forgotPassword:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
