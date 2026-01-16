import express from "express"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/me", protect, (req,res) => {
    res.json({
        message:"You are authorized",
        user:req.user
    })
})

export default router;