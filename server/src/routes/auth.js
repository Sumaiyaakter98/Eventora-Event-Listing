import express from "express"
const router= express.Router()
import{registerUser,loginUser,verifyOtp} from '../controllers/authController.js'

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/verify-otp',verifyOtp)

export default router