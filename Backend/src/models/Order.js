import mongoose  from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    {_id: false}
)

const orderSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        items:[orderItemSchema],
        totalAmount:{
            type:Number,
            required:true,
        },
        paymentMethod:{
            type:String,
            enum:["COD","ONLINE"],
            default:"COD"
        },
        paymentStatus:{
            type:String,
            enum:["PENDING","PAID"],
            default:"PENDING",
        },
        orderStatus:{
            type:String,
            enum:["PLACED","SHIPPED","DELIVERED","CANCELLED"],
            default:"PLACED"
        }

    },
    {
        timestamps:true
    }
);

export default mongoose.model("Order",orderSchema);