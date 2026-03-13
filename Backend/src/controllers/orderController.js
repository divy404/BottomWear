import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";

export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    for (const item of cart.items) {
      const product = item.product;

      const sizeObj = product.sizes.find((s) => s.size === item.size);

      if (!sizeObj || sizeObj.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} (${item.size})`,
        });
      }
    }
    const order = await Order.create(
      [
        {
          user: userId,
          items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cart.totalPrice,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
        },
      ],
      { session },
    );
    for (const item of cart.items) {
      const product = item.product;

      const sizeObj = product.sizes.find((s) => s.size === item.size);

      sizeObj.stock -= item.quantity;

      await product.save({ session });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    const user = await User.findById(userId);

    const itemsText = order[0].items
      .map((item) => `${item.quantity} item(s)`)
      .join("\n");

    const emailText = `
Hi ${user.name},

Your order has been placed successfully!

Order ID: ${order[0]._id}

Total Amount: ₹${order[0].totalAmount}

Thank you for shopping with us.
`;

    await sendEmail(user.email, "Order Confirmation - BottomWear", emailText);

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    // this makes sure new order appears at top

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.json(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    // optional: auto-set payment status
    if (status === "DELIVERED" && order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
