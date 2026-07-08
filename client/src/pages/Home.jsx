// import React, { useState, useEffect, useRef } from "react"; // ✅ useRef যুক্ত করা হয়েছে
// import { Link } from "react-router-dom"; 
// import api from "../utilies/axios"; // ✅ পূর্বের আলোচনার 'utilities' পাথ অনুযায়ী ফিক্সড

// import {
//   FaSearch,
//   FaRegClock,
//   FaTicketAlt,
//   FaShieldAlt,
//   FaCalendarAlt,
//   FaMapMarkerAlt,
// } from "react-icons/fa";

// const Home = () => {
//   const [events, setEvents] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   // ✅ ১. মেমোরি লিক এবং আনমাউন্টেড স্টেট আপডেট এরর ফিক্স করার জন্য রেফ ডিক্লেয়ার করা হলো
//   const isMounted = useRef(true);

//   // কম্পোনেন্ট মাউন্ট ও আনমাউন্ট ট্র্যাকিং এফেক্ট
//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//  const fetchEvents = async (searchQuery) => {
//   try {
//     setLoading(true);
//     // searchQuery ব্ল্যাঙ্ক হলে বা ডেটা পাঠাতে encodeURIComponent সেফটি দেয়
//     const { data } = await api.get(
//       `/events?search=${encodeURIComponent(searchQuery || "")}`,
//     );

//     if (isMounted.current) {
//       // ✅ পরিবর্তন: ব্যাকএন্ড থেকে আসা data.events চেক করা হচ্ছে
//       if (data && Array.isArray(data.events)) {
//         setEvents(data.events); 
//       } else if (Array.isArray(data)) {
//         setEvents(data); // ব্যাকআপ হিসেবে সরাসরি অ্যারে আসলে হ্যান্ডেল করবে
//       } else {
//         setEvents([]); 
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     if (isMounted.current) setEvents([]); 
//   } finally {
//     if (isMounted.current) setLoading(false);
//   }
// };

//   // ✅ ২. useEffect এর ভেতরে fetchEvents এ 'search' পাস করা হলো ডাইনামিক সার্চিং নিশ্চিত করতে
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       fetchEvents(search);
//     }, 400); // ৪00ms debounce টাইম টাইপিং এক্সপেরিয়েন্স স্মুথ করবে

//     return () => clearTimeout(timeoutId);
//   }, [search]);

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Hero Section */}
//       <div className="relative bg-black text-white rounded-3xl overflow-hidden mb-12 shadow-2xl mx-2 mt-4">
//         <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
//         <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
//           <span className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20">
//             Welcome to Eventora
//           </span>
//           <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
//             Find Your Next <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
//               Unforgettable
//             </span>{" "}
//             Experience
//           </h1>
//           <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
//             Discover the best tech conferences, late-night music festivals, and
//             hands-on workshops happening directly in your area. Secure your spot
//             today.
//           </p>

//           <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
//             <FaSearch className="absolute left-6 text-gray-500 text-xl group-focus-within:text-black transition-colors" />
//             <input
//               type="text"
//               placeholder="Search events by title..."
//               className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-gray-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Why Choose Us / Features row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
//           <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
//             <FaRegClock />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Booking</h3>
//           <p className="text-gray-500 text-sm leading-relaxed">
//             Secure your tickets instantly with our fast streamlined booking
//             infrastructure built for speed.
//           </p>
//         </div>
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
//           <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
//             <FaTicketAlt />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Access</h3>
//           <p className="text-gray-500 text-sm leading-relaxed">
//             Download tickets instantly or manage them right from your personal
//             dashboard with ease.
//           </p>
//         </div>
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
//           <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
//             <FaShieldAlt />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
//           <p className="text-gray-500 text-sm leading-relaxed">
//             All transactions and registrations are bounded by cutting-edge
//             security and 2FA OTP tech.
//           </p>
//         </div>
//       </div>

//       {/* Events Header */}
//       <div className="flex items-center justify-between mb-8 px-4 border-b border-gray-200 pb-4">
//         <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Events</h2>
//         <div className="text-gray-500 font-medium text-sm bg-gray-100 px-3 py-1 rounded-full">
//           {events.length} results found
//         </div>
//       </div>

//       {/* Event List Rendering */}
//       <div className="px-4 flex-grow">
//         {loading ? (
//           <div className="text-center py-20 text-xl font-semibold text-gray-600">
//             Loading events...
//           </div>
//         ) : events.length === 0 ? (
//           <div className="text-center py-20 text-xl text-gray-500">
//             No events found matching your search.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {Array.isArray(events) &&
//               events.map((event) => {
//                 const total = event.totalSeats || 1;
//                 const available = event.availableSeats ?? 0;
//                 const fillPercentage = Math.max(
//                   0,
//                   Math.min(100, ((total - available) / total) * 100),
//                 );

//                 return (
//                   <div
//                     key={event._id}
//                     className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col"
//                   >
//                     <div className="h-48 bg-gray-200 overflow-hidden relative">
//                       {event.imgUrl ? (
//                         <img
//                           src={event.imgUrl}
//                           alt={event.title}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
//                           {event.category || "Event"}
//                         </div>
//                       )}
//                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
//                         {event.ticketPrice === 0 ? (
//                           <span className="text-green-600 font-bold">FREE</span>
//                         ) : (
//                           <span className="text-gray-900">₹{event.ticketPrice}</span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="p-6 flex-grow flex flex-col">
//                       <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
//                         {event.category}
//                       </div>
//                       <h2 className="text-xl font-bold text-gray-800 mb-3">
//                         {event.title}
//                       </h2>
//                       <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
//                         <div className="flex items-center gap-2">
//                           <FaCalendarAlt className="text-gray-400" />
//                           <span>
//                             {new Date(event.date).toLocaleDateString(undefined, {
//                               weekday: "long",
//                               year: "numeric",
//                               month: "long",
//                               day: "numeric",
//                             })}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <FaMapMarkerAlt className="text-gray-400" />
//                           <span>{event.location}</span>
//                         </div>
//                       </div>
//                       <div className="mt-auto">
//                         <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
//                           <div
//                             className="bg-gray-700 h-2 rounded-full"
//                             style={{ width: `${fillPercentage}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-xs text-gray-500 mb-4">
//                           {available <= 0 ? (
//                             <span className="text-red-500 font-semibold">Sold Out</span>
//                           ) : (
//                             `${available} of ${event.totalSeats} seats remaining`
//                           )}
//                         </p>
//                         <Link
//                           to={`/events/${event._id}`}
//                           className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition"
//                         >
//                           View Details
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//         )}
//       </div>

//       {/* Footer Section */}
//       <footer className="mt-24 pt-16 pb-8 border-t border-gray-200 text-center">
//         <div className="flex justify-center items-center gap-2 mb-4">
//           <FaTicketAlt className="text-gray-800 text-2xl" />
//           <span className="text-xl font-bold text-gray-900">Eventora</span>
//         </div>
//         <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
//           The simplest, most dynamic way to manage, discover, and host
//           world-class events in your local city. Let's make memories together.
//         </p>
//         <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
//           &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;



import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; 
import api from "../utilies/axios"; 

import {
  FaSearch,
  FaRegClock,
  FaTicketAlt,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchEvents = async (searchQuery) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/events?search=${encodeURIComponent(searchQuery || "")}`,
      );

      if (isMounted.current) {
        if (data && Array.isArray(data.events)) {
          setEvents(data.events); 
        } else if (Array.isArray(data)) {
          setEvents(data); 
        } else {
          setEvents([]); 
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      if (isMounted.current) setEvents([]); 
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents(search);
    }, 400); 

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 🔷 Hero / Banner Section - With ultra light and soft violet look */}
      <div className="relative bg-violet-50 bg-[url('https://preview.colorlib.com/theme/manup/img/hero.jpg')] bg-cover bg-center h-[520px] flex items-center text-white mb-12 shadow-xl mx-2 mt-4 rounded-3xl overflow-hidden">
        {/* হালকা সফট লাইট ওভারলে */}
        <div className="absolute inset-0 bg-violet-400/20 backdrop-blur-[0.5px]"></div>
        {/* নিচ থেকে হালকা স্মুদি গ্রেডিয়েন্ট শ্যাডো */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-violet-900/30 to-black/20"></div>
        
        <div className="relative container mx-auto text-center px-4 z-10 flex flex-col items-center">
          <span className="bg-white/30 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-white/30 shadow-sm">
            Welcome to Eventora
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
            Discover Local Events Near You
          </h1>
          <p className="text-violet-50 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-normal drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Find, save, and manage events easily. Tech conferences, music festivals, and workshops.
          </p>

          {/* Search Box inside Hero */}
          <div className="w-full max-w-xl mx-auto relative flex items-center shadow-xl group">
            <FaSearch className="absolute left-6 text-violet-400 text-xl group-focus-within:text-violet-600 transition-colors" />
            <input
              type="text"
              placeholder="Search events by title..."
              className="w-full pl-15 pr-6 py-4 rounded-full text-base text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-violet-400 focus:outline-none transition-all placeholder-gray-400 font-medium shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Why Choose Us / Features row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4 max-w-7xl mx-auto w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-violet-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-violet-200">
            <FaRegClock />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Booking</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Secure your tickets instantly with our fast streamlined booking infrastructure.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-violet-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-violet-200">
            <FaTicketAlt />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Access</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Download tickets instantly or manage them right from your dashboard.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-violet-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-violet-200">
            <FaShieldAlt />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            All transactions and registrations are bounded by cutting-edge security.
          </p>
        </div>
      </div>

      {/* Events Header */}
      <div className="flex items-center justify-between mb-8 px-4 border-b border-gray-200 pb-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-[#0a2642]">Upcoming Events</h2>
        <div className="text-violet-700 font-medium text-sm bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
          {events.length} results found
        </div>
      </div>

      {/* Event List Rendering */}
      <div className="px-4 flex-grow max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20 text-xl font-semibold text-violet-600">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-xl text-gray-500 italic">
            No events found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(events) &&
              events.map((event) => {
                const total = event.totalSeats || 1;
                const available = event.availableSeats ?? 0;
                const fillPercentage = Math.max(
                  0,
                  Math.min(100, ((total - available) / total) * 100),
                );

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
                  >
                    <div className="h-48 bg-gray-200 overflow-hidden relative">
                      {event.imgUrl ? (
                        <img
                          src={event.imgUrl}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-violet-50 text-violet-600 font-bold text-2xl">
                          {event.category || "Event"}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        {event.ticketPrice === 0 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          <span className="text-violet-700">₹{event.ticketPrice}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                        {event.category}
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-violet-600 transition-colors">
                        {event.title}
                      </h2>
                      <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-violet-400" />
                          <span>
                            {new Date(event.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-violet-400" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-violet-600 h-2 rounded-full"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          {available <= 0 ? (
                            <span className="text-red-500 font-semibold">Sold Out</span>
                          ) : (
                            `${available} of ${event.totalSeats} seats remaining`
                          )}
                        </p>
                        <Link
                          to={`/events/${event._id}`}
                          className="block w-full text-center bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-300 border border-violet-100"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="mt-24 pt-16 pb-8 border-t border-gray-200 text-center bg-white">
        <div className="flex justify-center items-center gap-2 mb-4">
          <FaTicketAlt className="text-violet-600 text-2xl" />
          <span className="text-xl font-bold text-gray-900">Eventora</span>
        </div>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto px-4">
          The simplest, most dynamic way to manage, discover, and host world-class events in your local city.
        </p>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;