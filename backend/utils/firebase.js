let admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
let serviceAccount = require(processs.env.FIREBASE_ADMIN_SDK);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
