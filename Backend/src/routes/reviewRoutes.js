import express from "express";

import {
    addReview,getProductReviews,updateReview
} from "../controllers/reviewController.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:productId",protect,addReview);
router.get("/:productId",getProductReviews);
router.put("/:productId",protect,updateReview);

export default router;