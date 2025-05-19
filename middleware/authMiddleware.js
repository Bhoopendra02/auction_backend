const jwt = require('jsonwebtoken');

require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET; 

const authenticate = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  try {
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    let decoded = jwt.verify(token, JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

const checkRole = (roles) => 
       (req,res,next)=> {
    let token = req.headers.authorization?.split(' ')[1];
    try {
      if (!token) {
        return res.status(401).json({ message: 'Authentication failed: No token provided' });
      }
      console.log(JWT_SECRET)
      let decoded = jwt.verify(token,JWT_SECRET);
      
      
      req.userData = decoded;
     
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Authorization failed: Insufficient privileges' });
      }

      next();
    } catch (error) {
      console.log(error)
      console.log(token)
      return res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
       };


module.exports = { checkRole, authenticate };