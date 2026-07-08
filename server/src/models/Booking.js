import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    numberOfTickets: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['non-paid', 'paid', 'failed'],
        default: 'non-paid'
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});


const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;