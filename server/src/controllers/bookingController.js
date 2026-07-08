

import OTP from "../models/OTP.js";
import Event from "../models/event.js";
import Booking from "../models/Booking.js";
import { sendOtpEmail, sendBookingEmail } from "../utility/email.js";

// ওটিপি জেনারেটর ফাংশন
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ১. বুকিং ওটিপি পাঠানোর কন্ট্রোলার
export const sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOtp();
        
        await OTP.findOneAndUpdate(
            { email: req.user.email, action: "event_booking" },
            { otp, createdAt: new Date() }, // TTL ইনডেক্স অনুযায়ী এটি অটো ডিলিট হবে
            { upsert: true, new: true }
        );

        // ইমেইলে ওটিপি পাঠানো
        await sendOtpEmail(req.user.email, otp, "event_booking");
        
        return res.status(200).json({ success: true, message: "Booking OTP sent successfully to your email" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ২. ওটিপি ভেরিফাই করে ইভেন্ট বুক করার কন্ট্রোলার (Pending State)
export const bookEvent = async (req, res) => {
    const { eventId, otp, numberOfTickets } = req.body; 

    try {
        if (!eventId || !otp) {
            return res.status(400).json({ success: false, message: "Event ID and OTP are required" });
        }

        // ক্লায়েন্ট যদি টিকেটের সংখ্যা না পাঠায়, তবে ডিফল্ট ১টি ধরা হবে
        const ticketsToBook = numberOfTickets ? Number(numberOfTickets) : 1;

        // ১. ওটিপি ভেরিফাই করা
        const otpRecord = await OTP.findOne({ email: req.user.email, action: "event_booking", otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // ২. ইভেন্ট চেক করা এবং পর্যাপ্ত সিট আছে কিনা দেখা
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }    
        
        if (event.availableSeats < ticketsToBook) {
            return res.status(400).json({ 
                success: false, 
                message: `Not enough seats available. Only ${event.availableSeats} seats left.` 
            });
        }

        // ৩. ইউজার অলরেডি এই ইভেন্ট বুক করেছে কিনা চেক করা
        const existingBooking = await Booking.findOne({ userId: req.user._id, event: eventId });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: "You have already booked this event" });
        }

        // মোট প্রাইস ক্যালকুলেশন
        const calculatedTotalPrice = event.ticketPrice * ticketsToBook;

        // ৪. ডাটাবেজে বুকিং রেকর্ড তৈরি (স্কিমা অনুযায়ী ফিল্ড সেট করা হয়েছে)
        const booking = await Booking.create({
            userId: req.user._id, 
            event: eventId,     
            numberOfTickets: ticketsToBook,
            totalPrice: calculatedTotalPrice,
            amount: calculatedTotalPrice, // আপনার স্কিমার 'amount' ফিল্ডের জন্য
            status: "pending",
            paymentStatus: "non-paid"
        });

        // ৫. ইভেন্টের উপলব্ধ সিট বুকড টিকেটের সমপরিমাণ কমানো
        event.availableSeats -= ticketsToBook;
        await event.save();

        // ৬. সফল বুকিংয়ের পর ওটিপি ডাটাবেজ থেকে মুছে ফেলা
        await OTP.deleteMany({ email: req.user.email, action: "event_booking" });

        return res.status(201).json({ 
            success: true, 
            message: "Event booked successfully! Complete your payment.", 
            booking 
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ৩. অ্যাডমিন বা পেমেন্ট গেটওয়ে দ্বারা বুকিং কনফার্ম করার কন্ট্রোলার
export const confirmBooking = async (req, res) => {
    const { paymentStatus } = req.body; // রিকোয়েস্ট বডি থেকে "paid" অথবা "failed" আসবে

    // ইনপুট ভ্যালিডেশন
    if (!["paid", "failed"].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: "Valid payment status is required ('paid' or 'failed')" });
    }

    try {   
        // বুকিংয়ের আইডি দিয়ে খুঁজে বের করা এবং সাথে ইভেন্ট ও ইউজারের তথ্য পপুলেট করা
        const booking = await Booking.findById(req.params.id)
            .populate('event')
            .populate('userId', 'email name');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // অলরেডি কনফার্মড বুকিং হলে আর কিছু করার দরকার নেই
        if (booking.status === "confirmed") {
            return res.status(400).json({ success: false, message: "Booking is already confirmed" });
        }

        const userEmail = booking.userId.email;
        const userName = booking.userId.name || "User";
        const eventTitle = booking.event ? booking.event.title : "Event";

        // ক) পেমেন্ট সফল হলে (Confirmed)
        if (paymentStatus === "paid") {
            booking.status = "confirmed";
            booking.paymentStatus = "paid";
            await booking.save();

            // 📧 সাকসেস ইমেইল পাঠানো
            await sendBookingEmail(userEmail, userName, eventTitle, "confirmed");

            return res.status(200).json({ 
                success: true, 
                message: "Payment successful. Booking confirmed and email sent!", 
                booking 
            });
        } 
        
        // খ) পেমেন্ট ব্যর্থ বা ক্যান্সেল হলে (Cancelled)
        if (paymentStatus === "failed") {
            booking.status = "cancelled";
            booking.paymentStatus = "failed";
            await booking.save();

            // বুক করা টিকেটের সংখ্যা অনুযায়ী ইভেন্টের availableSeats পুনরায় ফিরিয়ে দেওয়া
            if (booking.event) {
                const event = await Event.findById(booking.event._id);
                if (event) {
                    event.availableSeats += booking.numberOfTickets;
                    await event.save();
                }
            }

            // 📧 ক্যানসেলেশন ইমেইল পাঠানো
            await sendBookingEmail(userEmail, userName, eventTitle, "cancelled");

            return res.status(200).json({ 
                success: false, 
                message: "Payment failed. Booking cancelled and email sent.", 
                booking 
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};


// ৪. ইউজারের নিজস্ব সব বুকিং দেখার কন্ট্রোলার (Get My Bookings)
export const getMyBookings = async (req, res) => {
    try {
        // রিকোয়েস্টের ইউজার আইডি (req.user._id) দিয়ে সব বুকিং খুঁজে বের করা
        // এবং সাথে ইভেন্টের প্রয়োজনীয় ডিটেইলস পপুলেট করা
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('event', 'title date location ticketPrice imgUrl')
            .sort({ createdAt: -1 }); // নতুন বুকিংগুলো প্রথমে দেখাবে

        return res.status(200).json({ 
            success: true, 
            count: bookings.length, 
            bookings 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ৫. ইউজার দ্বারা বুকিং বাতিল করার কন্ট্রোলার (Cancel Booking)
// export const cancelBooking = async (req, res) => {
//     try {
//         // বুকিং আইডি দিয়ে খোঁজা এবং সাথে ইভেন্ট ও ইউজারের ডেটা পপুলেট করা
//         const booking = await Booking.findById(req.params.id)
//             .populate('event')
//             .populate('userId', 'email name');

//         if (!booking) {
//             return res.status(404).json({ success: false, message: "Booking not found" });
//         }

//         // সিকিউরিটি চেক: অন্য কোনো ইউজার যাতে এই বুকিং বাতিল করতে না পারে
//         if (booking.userId._id.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking" });
//         }

//         // অলরেডি ক্যান্সেলড বা ফেইলড বুকিং হলে নতুন করে কিছু করার দরকার নেই
//         if (booking.status === "cancelled") {
//             return res.status(400).json({ success: false, message: "Booking is already cancelled" });
//         }

//         // ⚠️ গুরুত্বপূর্ণ বিজনেস লজিক চেক: 
//         // যদি বুকিং অলরেডি "confirmed" এবং "paid" হয়ে থাকে, তবে রিফান্ড পলিসি অনুযায়ী অ্যাডমিনের অনুমতি লাগতে পারে।
//         // এখানে সাধারণ লজিক দেওয়া হলো: ইউজার ক্যান্সেল করলে স্ট্যাটাস 'cancelled' হবে।
        
//         booking.status = "cancelled";
//         // যদি পেমেন্ট অলরে院ি করা হয়ে থাকে, পেমেন্ট স্ট্যাটাস আপনি আপনার লজিক অনুযায়ী 'refund-pending' বা 'failed' করতে পারেন।
//         // এখানে ডিফল্ট 'failed' বা পূর্বের নিয়মে রাখা হলো
//         if (booking.paymentStatus !== "paid") {
//             booking.paymentStatus = "failed";
//         }
        
//         await booking.save();

//         // 🔄 ইভেন্টের উপলব্ধ সিট (availableSeats) বুক করা টিকেটের সংখ্যা অনুযায়ী ফেরত দেওয়া
//         if (booking.event) {
//             const event = await Event.findById(booking.event._id);
//             if (event) {
//                 event.availableSeats += booking.numberOfTickets;
//                 await event.save();
//             }
//         }

//         // 📧 ইউজারকে বুকing বাতিলের কনফার্মেশন ইমেইল পাঠানো
//         const userEmail = booking.userId.email;
//         const userName = booking.userId.name || "User";
//         const eventTitle = booking.event ? booking.event.title : "Event";

//         await sendBookingEmail(userEmail, userName, eventTitle, "cancelled");

//         return res.status(200).json({ 
//             success: true, 
//             message: "Booking cancelled successfully, seats released and confirmation email sent.", 
//             booking 
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
//     }
// };
// ৫. ইউজার বা অ্যাডমিন দ্বারা বুকিং বাতিল করার কন্ট্রোলার (Cancel Booking)
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('event')
            .populate('userId', 'email name');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // 🔄 পুরাতন কোডটি পরিবর্তন করে এই লাইনটি দিন:
        // চেক করা হচ্ছে: ইউজার যদি নিজের বুকিং না করে থাকে এবং সে যদি অ্যাডমিনও না হয়, তবেই কেবল ব্লক করবে
        if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking" });
        }

        // অলরেডি ক্যান্সেলড বা ফেইলড বুকিং হলে নতুন করে কিছু করার দরকার নেই
        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled" });
        }
        
        booking.status = "cancelled";
        if (booking.paymentStatus !== "paid") {
            booking.paymentStatus = "failed";
        }
        
        await booking.save();

        // ইভেন্টের উপলব্ধ সিট (availableSeats) ফেরত দেওয়া
        if (booking.event) {
            const event = await Event.findById(booking.event._id);
            if (event) {
                event.availableSeats += booking.numberOfTickets;
                await event.save();
            }
        }

        // ইমেইল পাঠানো
        const userEmail = booking.userId.email;
        const userName = booking.userId.name || "User";
        const eventTitle = booking.event ? booking.event.title : "Event";

        await sendBookingEmail(userEmail, userName, eventTitle, "cancelled");

        return res.status(200).json({ 
            success: true, 
            message: "Booking cancelled successfully, seats released and confirmation email sent.", 
            booking 
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ৬. অ্যাডমিন প্যানেলের জন্য ডেটাবেজের সব বুকিং একসাথে দেখার কন্ট্রোলার (Get All Bookings)
export const getAllBookings = async (req, res) => {
    try {
        // ডেটাবেজ থেকে সব বুকিং খুঁজে বের করা
        // এবং সাথে সম্পর্কিত 'event' এবং 'userId' (শুধু name ও email) পপুলেট করা
        const bookings = await Booking.find()
            .populate('event', 'title date location ticketPrice')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 }); // একদম নতুন বুকিংগুলো ড্যাশবোর্ডের ওপরে দেখাবে

        return res.status(200).json(bookings);
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
};