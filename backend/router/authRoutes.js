const express = require('express');
const router = express.Router();
const { register, login, saveFcmToken } = require('../controller/authController');
const { notifyTaskAssignment } = require('../controller/notificationController'); // Assuming this controller is created

// Route to register user
router.post('/register', register);

// Route to login user
router.post('/login', login);

// Route to save FCM token
router.post('/fcm-token', saveFcmToken);

// Route to send task assignment notification
router.post('/notify-task', notifyTaskAssignment);

module.exports = router;
