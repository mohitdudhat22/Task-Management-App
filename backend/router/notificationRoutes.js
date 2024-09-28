const express = require('express');
const router = express.Router();
const  sendFirebaseNotification  = require('../controller/notificationController');

// Define route for sending notifications
router.post('/send', sendFirebaseNotification); 

module.exports = router;
