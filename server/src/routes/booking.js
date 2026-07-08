import express from "express";
import { protect,admin } from "../Middleware/authMiddleware.js";
import { bookEvent, sendBookingOTP, getMyBookings, confirmBooking, cancelBooking ,getAllBookings} from "../controllers/bookingController.js";
const router = express.Router();


router.post('/',protect,bookEvent )
router.post('/send-otp',protect,sendBookingOTP)
router.get('/my',protect,getMyBookings)
router.put('/:id/confirm',protect,admin,confirmBooking)
router.delete('/:id',protect,cancelBooking)
router.delete('/:id/admin', protect, admin, cancelBooking)
router.get('/all',protect,admin,getAllBookings)
export default router