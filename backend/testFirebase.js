const admin = require('./config/firebaseAdmin');

async function testFirebase() {
  try {
    const message = {
      notification: {
        title: 'Test',
        body: 'This is a test message'
      },
      topic: 'test-topic' // Replace with a valid topic or device token
    };
    
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

testFirebase();
