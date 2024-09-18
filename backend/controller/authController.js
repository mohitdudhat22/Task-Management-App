const UserModel = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Controller to register a user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Name, Email, Password, Role } = req.body;
    let user = await UserModel.findOne({ Email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    user = new UserModel({ Name, Email, Password: hashedPassword, Role });
    await user.save();
    console.log(user);
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true});
    res.status(200).json({ message: 'User registered successfully', token , user });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to login a user
const login = async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<this is the cookie");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Email, Password } = req.body;
    console.log(req.body)
    const user = await UserModel.findOne({ Email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'User logged in successfully', token });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to save FCM token
const saveFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fcmToken = fcmToken;
    await user.save();
    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { register, login, saveFcmToken };
