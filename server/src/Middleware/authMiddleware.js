import jwt from 'jsonwebtoken';
import User from '../models/user.js';


export const protect =async (req, res, next) => {
  // Implementation for authentication middleware
  let token= req.headers.authorization && req.headers.authorization.split(' ')[1];
  if(token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user =  await User.findById(decoded.id).select('-password');

        if(!req.user){
          return res.status(401).json({ message: "Not authorized, user not found" });
        }   
        next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
    } else {    
        return res.status(403).json({ message: "Not authorized as an admin" });
    }   

};


