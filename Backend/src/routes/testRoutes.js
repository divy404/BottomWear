import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/db-test", async (req, res) => {
  const count = await User.countDocuments(); 
  res.json({ message: "DB working", users: count });
});

export default router;
