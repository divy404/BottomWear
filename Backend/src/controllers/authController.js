import User from "../models/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req,res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({
                message:"User already exists"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        res.status(201).json({
            message:"User registered successfully",
            userId: user._id
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Internal server error"
        })
        
    }
}

export const login = async (req,res) => {
    try {
        const {email,password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            })
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                message:"Invalid Credentials"
            })
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(400).json({
                message:"Wrong Password"
            })
        }

        const token = jwt.sign(
            {id: user._id, role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );
        res.json({
            message:"Login Successful",
            token
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error"
        })
        
    }
}