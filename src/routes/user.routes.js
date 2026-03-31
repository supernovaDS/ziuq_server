import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import { updateProfile } from "../controllers/user.controller.js"

const router = express.Router()

router.put('/update-profile', protect, updateProfile);

export default router