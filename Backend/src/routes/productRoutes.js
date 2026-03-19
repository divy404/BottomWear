import express from "express";

import {
  createProduct,
  getProductById,
  getProducts,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
