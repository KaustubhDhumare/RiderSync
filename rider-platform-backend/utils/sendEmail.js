// import nodemailer from "nodemailer";

// const sendEmail = async (options) => {
//   // 1. Create a transporter using Gmail SMTP
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER, // Your Gmail address
//       pass: process.env.EMAIL_PASS, // Your generated 16-character App Password
//     },
//     connectionTimeout: 10000,
//     socketTimeout: 10000,
//   });

//   // 2. Define the email payload
//   const mailOptions = {
//     from: `Ride Tracker App <${process.env.EMAIL_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3. Send it
//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;


import { Resend } from 'resend';


const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // You must use this testing address unless you own a custom domain
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    console.log("Email sent successfully via HTTP:", data);
  } catch (error) {
    console.error("Resend HTTP API Error:", error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;