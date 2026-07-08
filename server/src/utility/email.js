import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// নোডমেইলার ট্রান্সপোর্টার সেটআপ
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_User,  // আপনার জিমেইল আইডি (.env ফাইল থেকে)
    pass: process.env.Email_Pass   // গুগলের অ্যাপ পাসওয়ার্ড
  }
});

// ডাইনামিক বুকিং ইমেইল পাঠানোর ফাংশন (Confirmed / Cancelled দুইটার জন্যই কাজ করবে)
export const sendBookingEmail = async (userEmail, userName, eventTitle, status) => {
  try {
    const isConfirmed = status === "confirmed";
    
    const subject = isConfirmed 
      ? `Event Booking Confirmed for ${eventTitle}` 
      : `Event Booking Cancelled for ${eventTitle}`;

    const htmlContent = isConfirmed
      ? `<p>Hi <strong>${userName}</strong>,</p>
         <p>Your booking for the event <strong>${eventTitle}</strong> has been successfully <strong>confirmed</strong>. 🎉</p>
         <p>Thank you for choosing our platform!</p>`
      : `<p>Hi <strong>${userName}</strong>,</p>
         <p>We are sorry to inform you that your booking for the event <strong>${eventTitle}</strong> has been <strong>cancelled</strong> due to a failed payment. ❌</p>
         <p>If money was deducted, it will be refunded shortly. Please try booking again.</p>`;

    const mailOptions = {
      from: process.env.Email_User,
      to: userEmail,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking ${status} email sent to ${userEmail} for ${eventTitle}`);
  } catch (error) {
    console.error(`Error sending booking email to ${userEmail} for ${eventTitle}:`, error);
  }
};


// ইমেইলে OTP পাঠানোর ফাংশন (Updated)
export const sendOtpEmail = async (email, Otp, type) => {
  try {
    // এখানে "account_verification" ছোট হাতের অক্ষরে চেক করা হচ্ছে
    const title = type === "account_verification" ? "Verify your Eventora Account" : "Eventora Booking verification";
    const msg = type === "account_verification" ? "Please use the following OTP to verify your new account." : "Please use the following OTP to verify your event Booking.";

    const mailOptions = {
      from: process.env.Email_User,
      to: email,
      subject: title,
      text: `Your OTP code is ${Otp}. It is valid for 5 minutes.`,
      html: `<h3>Welcome to our platform!</h3>
             <p style="color: #4b5563;">${msg}</p>
             <p>Your OTP code is: <b style="font-size: 18px; color: #1e40af;">${Otp}</b></p>
             <p style="color: #dc2626; font-size: 12px;">Note: This OTP will expire in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Otp email sent to ${email} for ${type}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error.message);
  }
};