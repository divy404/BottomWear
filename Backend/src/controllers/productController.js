import mongoose from "mongoose";
import Product from "../models/Product.js"

//admin creates products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, colors } = req.body;

    // extract image URLs from uploaded files
    const images = req.files.map((file) => file.path);

    const product = await Product.create({
      name,
      description,
      price,
      category,
      sizes: JSON.parse(sizes), // important (comes as string from form-data)
      colors: JSON.parse(colors),
      images,
    });

    res.status(201).json(product);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// get all products (for homepage  i think)
export const getProducts = async (req,res) => {
    try {
        const {category,search, minPrice, maxPrice, minRating, page=1, limit=10,sort} = req.query;
        
        //category filter
        const filter = {};
         if(category) {
            filter.category = category;
        }

        // search filter
         if (search) {
           filter.name = { $regex: search, $options: "i" };
         }

         // price filter
         if(minPrice || maxPrice) {
            filter.price={};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
         }

        //  rating filter 
        if(minRating) {
            filter.averageRating = {$gte: Number(minRating)};
        }
        //  pagination
         const skip = (Number(page)-1)*Number(limit);

        // sorting logic 
        let sortOption = {};
          if (sort === "price_asc") sortOption.price = 1;
          if (sort === "price_desc") sortOption.price = -1;
          if (sort === "newest") sortOption.createdAt = -1;
          if (sort === "rating") sortOption.averageRating = -1;

        const products = await Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit));

        const total = await Product.countDocuments(filter);
        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            products
    });
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