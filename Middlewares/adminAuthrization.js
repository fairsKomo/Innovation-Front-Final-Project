const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const adminMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if(!authHeader) return res.status(404).json({message: 'No token provided!'});

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(404).json({message: 'No token provided!'});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user) return res.status(404).json({message: 'No token provided!'});
        if(user.role !== 'admin') return res.status(403).json({message: 'Access denied!'});

        req.user = decoded;
        next();
    } catch(e){
        return res.status(400).json({message: 'Token invalid!'});
    }
};

module.exports = adminMiddleware;