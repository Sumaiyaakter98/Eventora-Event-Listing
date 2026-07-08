import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 select-none">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500 transform transition-all duration-300 hover:-translate-y-1">
                {/* Error Icon */}
                <FaTimesCircle className="text-red-500 text-7xl mx-auto mb-6 drop-shadow-md animate-pulse" />
                
                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    Booking Failed
                </h1>
                
                {/* Description */}
                <p className="text-gray-500 mb-8 text-base sm:text-lg leading-relaxed">
                    We couldn't process your payment. Please check your bank details, network connection, or try using a different payment method.
                </p>
                
                {/* Action Buttons */}
                <div className="space-y-3.5">
                    {/* Dynamic Retry Option */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-[0.99]"
                    >
                        Try Again
                    </button>

                    <Link 
                        to="/" 
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition duration-200 active:scale-[0.99]"
                    >
                        Browse Other Events
                    </Link>

                    <Link 
                        to="/dashboard" 
                        className="block w-full text-sm font-semibold text-gray-400 hover:text-gray-600 transition duration-200 pt-2 underline decoration-dashed"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;