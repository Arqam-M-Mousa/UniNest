const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/contact - Send contact form email
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim();
    const trimmedMessage = (message || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    if (!process.env.EMAIL_PASSWORD) {
      console.error("EMAIL_PASSWORD environment variable is missing");
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please try again later.",
      });
    }

    const emailUser = process.env.EMAIL_USER || "";
    if (!emailUser) {
      console.error("EMAIL_USER environment variable is missing");
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please try again later.",
      });
    }

    // Gmail SMTP transporter (requires app password if 2FA enabled)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true, // Gmail SMTPS
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const normalizedMessage = trimmedMessage.replace(/\n/g, "<br>");

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"UniNest Contact" <${emailUser}>`,
      to: process.env.EMAIL_TO || emailUser,
      replyTo: `"${trimmedName}" <${trimmedEmail}>`,
      subject: `UniNest Contact Form - Message from ${trimmedName}`,
      text: `New message from ${trimmedName} (${trimmedEmail})\n\n${trimmedMessage}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${trimmedName}</p>
        <p><strong>Email:</strong> ${trimmedEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${normalizedMessage}</p>
        <hr>
        <p style="color:#666;font-size:12px;">This email was sent from the UniNest contact form.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
