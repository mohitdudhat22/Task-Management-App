const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const authMiddleware = async(req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.decode(token.split(' ')[1]);
        req.user = decoded;
        console.log(req.user, 'req.user');
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;
