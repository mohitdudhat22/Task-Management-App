const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

// Define route for sending notifications
router.post('/send', (req, res) => {
  const { token, title, body } = req.body;

  notificationController.sendNotification(token, title, body)
    .then((response) => {
      res.status(200).json({ success: true, response });
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: error.message });
    });
});

module.exports = router;
