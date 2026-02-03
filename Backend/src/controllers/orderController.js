import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export const placeOrder = async (req,res) => {
    try {
        const userId = req.user.id;
        const {paymentMethod} = req.body;

        const cart = await Cart.findOne({user:userId});
        
        if(!cart || cart.items.length===0) {
            return res.status(400).json({
                message:"Cart is empty"
            })
        }

        const orderItems = cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
        }));

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount: cart.totalPrice,
            paymentMethod: paymentMethod || "COD",
            paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING"
        });

        //clear cart after order
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error"
        })
        
    }
}

export const getUserOrders = async (req,res) => {
    try {
        const userId = req.user.id;

        const orders  = await Order.find({user:userId}).sort({createdAt:-1});
        // this makes sure new order appears at top

        res.json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Internal server error"
        })
        
    }
}

export const getOrderById = async (req,res) => {
    try {
        const {orderId} = req.params;
        const userId = req.user.id;

        if(!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.json(400).json({
                message:"Invalid order ID"
            })
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        }).populate("items.product", "name price images");

        if(!order) {
            return res.status(404).json({
                message:"Order not found"
            })
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error"
        })
        
    }
}