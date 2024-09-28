
//importing script
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js')

const firebaseConfig = {
    apiKey: "AIzaSyDhk0hPcumicd-ldA2CcSVwQy4SBPH7wK0",
    authDomain: "event-management-app-301ba.firebaseapp.com",
    databaseURL: "https://event-management-app-301ba-default-rtdb.firebaseio.com",
    projectId: "event-management-app-301ba",
    storageBucket: "event-management-app-301ba.appspot.com",
    messagingSenderId: "559509618905",
    appId: "1:559509618905:web:4b1079660eb60a2ff8bec8",
    measurementId: "G-PL02RQH86M"
  }
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload){
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
})