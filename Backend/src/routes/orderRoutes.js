import express from "express";
import { placeOrder,getUserOrders,getOrderById,updateOrderStatus } from "../controllers/orderController.js";
import {protect} from "../middleware/authMiddleware.js";
import {adminOnly} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/",protect,placeOrder);
router.get("/",protect,getUserOrders);
router.get("/:orderId",protect,getOrderById);
router.put("/:orderId/status", protect, adminOnly, updateOrderStatus);


export default router;