const NotificationService = require("../services/NotificationService");

const sendFirebaseNotification = async (req, res) => {
    try {
        const { title, body, deviceToken } = req.body;
        await NotificationService.sendNotification(deviceToken, title, body);
        return res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = sendFirebaseNotification;
