const admin = require('../config/firebaseAdmin'); // Ensure firebaseConfig is properly set up
const UserModel = require('../models/User');

// Function to send notification
const sendNotification = async (token, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Controller to handle task assignment notifications
const notifyTaskAssignment = async (req, res) => {
  const { userId, taskTitle } = req.body;
  try {
    // Fetch user and their FCM token from the database
    const user = await UserModel.findById(userId);
    if (!user || !user.fcmToken) {
      return res.status(404).json({ message: 'User or FCM token not found' });
    }

    // Create the notification payload
    const message = {
      notification: {
        title: 'Task Assigned',
        body: `You have been assigned a new task: ${taskTitle}`,
      },
      token: user.fcmToken
    };

    // Send the notification
    const response = await admin.messaging().send(message);

    console.log('Successfully sent message:', response);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification', error: error.toString() });
  }
};

module.exports = {
  sendNotification,
  notifyTaskAssignment
}