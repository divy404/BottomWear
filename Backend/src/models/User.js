import mongoose from "mongoose";

const userSchema = new mongoose.Schema ({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true, lowercase:true,trim:true},
    password: {type:String,required:true},
    role : {
        type: String,
        enum: ["user","admin"],
        default:"user"
    },
    emailVerified: {
        type:Boolean,
        default:false
    },
    otpHash: String,
    otpExpires: Date,
},
    {timestamps:true}

);

export default mongoose.model("User", userSchema);