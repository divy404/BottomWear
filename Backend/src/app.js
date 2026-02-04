import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js"
import protectedRoutes from "./routes/protectedRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.send("Bottomwear API is running");
})

// app.use("/api/test",testRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/protected",protectedRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/reviews",reviewRoutes);

export default app;