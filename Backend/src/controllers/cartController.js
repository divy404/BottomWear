import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const qty = Number(quantity);

    if (!productId || !qty) {
      return res.status(400).json({
        message: "ProductId and quantity are required",
      });
    }

    if (qty < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCart = async (req,res) => {
    try {
        const userId = req.user.id
          const cart = await Cart.findOne({ user: userId }).populate(
            "items.product",
            "name price images",
          );

          // If no cart exists yet
          if (!cart) {
            return res.json({
              items: [],
              totalPrice: 0,
            });
          }

          res.json(cart);
    } catch (error) {
         console.error(error);
         res.status(500).json({
           message: "Server error",
         });
    }
}
