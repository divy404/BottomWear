import mongoose from "mongoose";
import Product from "../models/Product.js"

//admin creates products
export const createProduct = async (req,res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
}

// get all products (for homepage  i think)
export const getProducts = async (req,res) => {
    try {
        const {category} = req.query;

        const filter = {};
         if(category) {
            filter.category = category;
         }
        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error"
        })
        
    }
    
}

// get product by id
export const getProductById = async (req,res) => {
    try {
        const {id} = req.params;
        
        // if id valid or not 
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message:"Invalid product ID"
            });
        }

        // find product by id
        const product = await Product.findById(id);
        
        // product not found 
        if(!product) {
            return res.status(404).json({
                message:"Product not found"
            });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error"
        })
        
    }
}