import express from "express"
import { addToCart,getCart,updateCartItem } from "../controllers/cartController.js"
import {protect} from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/",protect,addToCart); // to add from product page in cart
router.get("/",protect,getCart); 
router.put("/",protect,updateCartItem); // update _,- inside cart


export default router;