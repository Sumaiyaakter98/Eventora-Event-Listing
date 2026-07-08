import Event from "../models/event.js";

// ১. সব ইভেন্ট গেট করা
export const getAllEvents = async (req, res) => {
    try {
        const filter = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.ticketPrice) {
            filter.ticketPrice = { $lte: Number(req.query.ticketPrice) };
        }

        const events = await Event.find(filter);
        return res.status(200).json({ success: true, events });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ২. নির্দিষ্ট ইভেন্ট গেট করা
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }   
        return res.status(200).json({ success: true, event });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ৩. নতুন ইভেন্ট তৈরি করা
export const createEvent = async (req, res) => {
    try {   
        const { title, description, date, location, category, totalSeats, ticketPrice, imgUrl } = req.body;
        
        if (!title || !description || !date || !location || !category || !totalSeats || !ticketPrice || !imgUrl) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            totalSeats: Number(totalSeats),     
            availableSeats: Number(totalSeats),
            ticketPrice: Number(ticketPrice),
            imgUrl,
            createdBy: req.user._id
        });

        await event.save();
        return res.status(201).json({ success: true, message: "Event created successfully", event });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};

// ৪. ইভেন্ট আপডেট করা
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }   

        const { title, description, date, location, category, totalSeats, ticketPrice, imgUrl } = req.body;
        
        let updatedAvailableSeats = event.availableSeats;
        
        if (totalSeats !== undefined) {
            const newTotal = Number(totalSeats);
            const bookedSeats = event.totalSeats - event.availableSeats; 
            
            if (newTotal < bookedSeats) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Total seats cannot be less than already booked seats (${bookedSeats} seats are already booked).` 
                });
            }
            
            updatedAvailableSeats = newTotal - bookedSeats;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title: title || event.title,
                description: description || event.description,
                date: date || event.date,
                location: location || event.location,
                category: category || event.category,
                totalSeats: totalSeats !== undefined ? Number(totalSeats) : event.totalSeats,
                availableSeats: updatedAvailableSeats,
                ticketPrice: ticketPrice !== undefined ? Number(ticketPrice) : event.ticketPrice,
                imgUrl: imgUrl || event.imgUrl
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }   
};

// ৫. ইভেন্ট ডিলিট করা
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);      
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        return res.status(200).json({ success: true, message: "Event deleted successfully" });
    }    
    catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};