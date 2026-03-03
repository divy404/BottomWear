import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

import crypto from "crypto"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { send } from "process";


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash OTP before storing
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otpHash,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendEmail(email, "Verify your email", `Your OTP is: ${otp}`);

    res.status(201).json({
      message: "User registered. Please verify your email with OTP.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

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
        if(!user.emailVerified) {
            return res.status(403).json({
                message:"Please verify your email before logging in"
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

export const verifyOtp = async(req,res) => {
    try {
        const {email,otp} = req.body;

        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({
                message:"User not found"
            });
        }
        if(user.otpExpires< Date.now()) {
            return res.status(400).json({
                message:"OTP expired"
            })
        }

        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        if(hashedOtp !== user.otpHash) {
            return res.status(400).json({
                message:"Invalid Otp"
            })
        }

        user.emailVerified = true;
        user.otpHash = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.json({
            message:"Email verified successfully."
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Sever error"
        })
        
    }
}