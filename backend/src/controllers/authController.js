// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production
const JWT_EXPIRES_IN = '24h';

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }
    
    // Check if username already exists
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    await User.create({
      username,
      password: hashedPassword,
      is_admin: false // Default to non-admin
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }
    
    // Find the user
    const user = await User.getByUsername(username);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        is_admin: Boolean(user.is_admin)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
  res.json({ 
    success: true, 
    data: {
      id: req.user.id,
      username: req.user.username,
      is_admin: req.user.is_admin
    } 
  });
};