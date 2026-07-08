import express from "express";
import { protect,admin } from "../Middleware/authMiddleware.js";
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from "../controllers/eventsController.js";
const router = express.Router();


// get all events
router.get('/',getAllEvents)
// get event by id
router.get('/:id',getEventById)
// create event admin only
router.post('/',protect,admin,createEvent)
// update event admin only
router.put('/:id',protect,admin,updateEvent)
// delete event admin only
router.delete('/:id',protect,admin,deleteEvent)




export default router