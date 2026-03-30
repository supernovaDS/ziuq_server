import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Fallback to header if no cookie in case
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user
    req.user = await User.findById(decoded.id).select('-password');

    next();

  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};