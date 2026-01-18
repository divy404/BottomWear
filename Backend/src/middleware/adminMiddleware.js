export const adminOnly = (req,res,next) => {
    // req.user already set by protect route 
    if(!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            "message":"Admin access required"
        })
    }
    next();
}