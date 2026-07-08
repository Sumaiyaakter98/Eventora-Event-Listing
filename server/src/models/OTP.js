import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
   
    email: {
      type: String,
      required: true,
      
    },
   
    otp:{
        type:String,
        required: true
    },
    action:{
        type:String,
        enum:["account_verification","event_booking"],
        required: true

    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 300 seconds = 5 minutes. MongoDB will automatically delete this doc after 5 mins!
    },
  },
  {
    timestamps: true,
  },
);
const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
