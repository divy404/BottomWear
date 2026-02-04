import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const addReview = async (req,res) => {
    try {
        const userId = req.user.id;
        const {productId} = req.params;
        const {rating,comment} = req.body;

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({message:"Inavlid product ID"});

        }
        // check if user purchased product 

        const hasPurchased = await Order.findOne({
            user:userId,
            "items.product": productId
        });

        if(!hasPurchased) {
            return res.status(403).json({
                message:"You must purchase this product to review it"
            })
        }

        const review = await Review.create({
            user:userId,
            product:productId,
            rating,
            comment
        })

        //recalculate product rating

        const reviews = await Review.find({product:productId});
        const avgRating = reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length;
        
        await Product.findByIdAndUpdate(productId,{
            averageRating:avgRating.toFixed(1),
            numReviews: reviews.length
        });

        res.status(201).json(review);
    } catch (error) {
        if(error.code===11000) {
            return res.status(400).json({
                message:"You already reviewed this product"
            })
        }
        console.error(error);
        res.status(500).json({message:"Server error"});
        
    }
}

export const getProductReviews = async (req,res) => {
    try {
        const {productId} = req.params;

        const reviews = await Review.find({product:productId}).populate("user","name").sort({createdAt:-1});
        res.json(reviews);
    } catch (error) {
        console.error(error);
          res.status(500).json({ message: "Server error" });
        
    }
}

export const updateReview = async (req,res) => {
    try {
        const userId = req.user.id;
        const{productId} = req.params;
        const {rating, comment} = req.body;

        if(!rating || rating<1|| rating>5) {
            return res.status(400).json({
                message:"Rating must be between 1 to 5"
            })
        }
        // find exisitng review 
        const review = await Review.findOne({
            user:userId,
            product:productId
        });

        if(!review) {
            return res.status(404).json({
                message:"Review not found"
            })
        }

        //update fields;

        review.rating = rating;
        review.comment = comment;
        await review.save();

        //recalculate product rating

        const reviews = await Review.find({product:productId});

        const avgRating = reviews.reduce((sum,r)=> sum+r.rating,0) / reviews.length;

        await Product.findByIdAndUpdate(productId, {
          averageRating: avgRating.toFixed(1),
          numReviews: reviews.length,
        });
        res.json(review);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Server error"
        })
        
    }
}