const admin = require('firebase-admin');
const serviceAccount = require('../task-manegement-app.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
