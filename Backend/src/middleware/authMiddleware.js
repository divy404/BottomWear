import jwt from "jsonwebtoken";

export const protect = (req,res,next) => {
    try {
        // check header exist
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message:"Not authorized, token missing"
            })
        }
        // extract token 
        const token = authHeader.split(" ")[1];

        // verify token 
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decoded //attaching user info to request

        next();
        console.log("JWT_SECRET:", process.env.JWT_SECRET);

    } catch (error) {
        return res.status(401).json({
            message:"Not authorized, token invalid"
        })
    }
}