import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your generated 16-character App Password
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  // 2. Define the email payload
  const mailOptions = {
    from: `Ride Tracker App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send it
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
