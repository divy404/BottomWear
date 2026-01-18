import express from "express";

import {
  createProduct,
  getProductById,
  getProducts,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
