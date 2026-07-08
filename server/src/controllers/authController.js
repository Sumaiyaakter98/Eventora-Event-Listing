import User from "../models/User.js";
import bcrypt from 'bcrypt';
import OTP from "../models/OTP.js"; 
import { sendOtpEmail } from "../utility/email.js"; 
import jwt from "jsonwebtoken"; 

// ==========================================
// ১. ইউজার রেজিস্ট্রেশন ফাংশন
// ==========================================
export const registerUser = async (req, res) => {
  console.log("------ API HIT SUCCESSFUL ------"); 
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" }); 
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000); // ৫ মিনিট মেয়াদ

    // নতুন ইউজার তৈরি
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false
    });

    // OTP কালেকশনে সেভ (অ্যাকশন নাম ছোট হাতের "account_verification")
    await OTP.create({ 
      email, 
      otp: generatedOtp, 
      action: "account_verification",
      expiresAt: otpExpiryTime 
    });

    // ইমেইল পাঠানো
    await sendOtpEmail(email, generatedOtp, "account_verification");

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for the OTP.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
};

// ==========================================
// ২. লগইন ইউজার
// ==========================================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // ইউজার যদি ভেরিফাইড না থাকে (এখানে মেইল পাঠানোর টাইপো ফিক্স করা হয়েছে)
    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);

      await OTP.deleteMany({ email, action: "account_verification" }); 
      
      await OTP.create({ 
        email, 
        otp, 
        action: "account_verification",
        expiresAt: otpExpiryTime 
      });
      
      // 💡 Fix: এখানে "account_Verification" কে ছোট হাতের "account_verification" করা হলো
      await sendOtpEmail(email, otp, "account_verification");
 
      return res.status(403).json({ success: false, message: "Account not verified. Please verify your account first." });
    }

    // সফল লগইনের জন্য টোকেন তৈরি
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7h" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
}; 

// ==========================================
// ৩. ওটিপি ভেরিফিকেশন ফাংশন
// ==========================================
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // ১. ওটিপি চেক করা
    const otpRecord = await OTP.findOne({ email, otp, action: "account_verification" });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // ২. ইউজার খুঁজে বের করা
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    // ৩. অ্যাকাউন্ট ভেরিফাইড করা
    user.isVerified = true;
    await user.save();

    // ৪. ওটিপি ডিলিট করা
    await OTP.deleteOne({ _id: otpRecord._id });

    // ৫. টোকেন তৈরি (ইউজার যেন সরাসরি লগইন হয়ে যায়)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7h" });

    // 💡 Fix: অতিরিক্ত ব্র্যাকেট রিমুভ করে রেসপন্স ক্লিন করা হয়েছে
    res.status(200).json({
      success: true,
      message: "Account verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
};