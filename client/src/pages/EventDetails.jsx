import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utilies/axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        if (isMounted) {
          if (data && data.event) {
            setEvent(data.event);
          } else {
            setEvent(data);
          }
        }
      } catch (err) {
        if (isMounted) setError("Failed to load event details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (!showOTP) {
        // Step 1: Request OTP
        // ✅ পরিবর্তন: আলাদা config পাস না করে ইন্টারসেপ্টরের ওপর দায়িত্ব ছেড়ে দেওয়া হয়েছে, যা বেশি নিরাপদ।
        await api.post("/booking/send-otp", { email: user.email });
        setShowOTP(true);
        setSuccessMsg(
          "OTP sent to your email. Please verify to confirm booking.",
        );
      } else {
        // Step 2: Verify OTP and finalize booking
        // ✅ পরিবর্তন: ইন্টারসেপ্টর ব্যবহার করায় এখানেও ম্যানুয়াল হেডার লাগবে না।
        await api.post("/booking", { eventId: event._id,otp: Number(otp),email: user.email});
        setSuccessMsg("Booking requested! Awaiting admin confirmation.");
        setShowOTP(false);
        setOtp("");

        setEvent((prev) =>
          prev ? { ...prev, availableSeats: prev.availableSeats - 1 } : null,
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold text-gray-600">
        Loading...
      </div>
    );
  if (error && !event)
    return (
      <div className="text-center py-20 text-xl text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!event)
    return (
      <div className="text-center py-20 text-xl text-gray-500 font-semibold">
        Event not found
      </div>
    );

  const isSoldOut = event.availableSeats <= 0;

  const getButtonText = () => {
    if (bookingLoading) return "Processing...";
    if (showOTP) return "Verify OTP & Confirm";
    if (isSoldOut) return "Sold Out";
    return "Confirm Registration";
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {event.imgUrl ? (
        <img
          src={event.imgUrl}
          alt={event.title}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
          {event.category}
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="flex-1">
            <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              {event.category}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {event.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Booking Details
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Ticket Price
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {event.ticketPrice === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `₹${event.ticketPrice}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaChair />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Availability
                  </p>
                  <p className="font-bold text-gray-800">
                    <span
                      className={
                        event.availableSeats < 10 ? "text-orange-500" : ""
                      }
                    >
                      {event.availableSeats}
                    </span>{" "}
                    / {event.totalSeats}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </p>
                  <p className="font-bold text-gray-800">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="font-bold text-gray-800">{event.location}</p>
                </div>
              </div>
            </div>

            {showOTP && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP to Confirm
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg outline-none focus:border-transparent"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                />
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition duration-200 transform shadow-lg ${
                isSoldOut || bookingLoading || (showOTP && !otp)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {getButtonText()}
            </button>

            {error && (
              <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded text-sm border border-red-100">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded text-sm border border-green-100">
                {successMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
