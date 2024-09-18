const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { Name, Email, Password, Role } = req.body;
    let user = await UserModel.findOne({ Email });
    if (user) return res.status(400).json({ message: 'User already exists' });
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    user = new UserModel({ Name, Email, Password: hashedPassword, Role });
    await user.save();
  
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'User registered successfully' });
  };
  
 const login = async (req, res) => {
    const { Email, Password } = req.body;
    const user = await UserModel.findOne({ Email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true });
    res.status(200).json({ message: 'User logged in successfully', token });

    
  };

module.exports = { register, login };