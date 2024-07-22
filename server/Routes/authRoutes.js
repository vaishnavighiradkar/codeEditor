const express = require('express');
const passport = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Schema/User');
const Code = require('../Schema/Code'); // Import the Code schema
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { userEmail, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const dummy = await User.findOne({ userEmail });
    if (dummy) {
      return res.status(500).json({ message: 'Email already exists' });
    }
    const user = new User({ userEmail, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      const token = generateToken(user);
      return res.json({ token });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
});

function generateToken(user) {
  const { _id, userEmail, role } = user;
  const token = jwt.sign({ id: _id, email: userEmail, role }, 'secret123', { expiresIn: '1h' });
  return token;
}

// Middleware to verify token and extract user ID
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Save code
router.post('/savecode', authenticateToken, async (req, res) => {
  try {
    const { code ,fileName } = req.body;
    const userId = req.user.id;
    const newCode = new Code({ userId, code, fileName });
    await newCode.save();
    res.status(201).json({ message: 'Code saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get code
router.get('/getcode', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const codes = await Code.find({ userId });
    res.status(200).json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
