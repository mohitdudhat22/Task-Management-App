import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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

const vapidKey = "BKfXPHqTTKdC7-bBLXXjMTuiIR8Yojq00kEZbp_9NfKO7xacJuM5oJPlfWkiUy7AfdHshwehuHUUbA_K4Ukoxcc"
const app = initializeApp(firebaseConfig);  
const messaging = getMessaging(app);
export const requestFCMToken = async()=>{
    return Notification.requestPermission().then((permission)=>{
        if(permission==="granted"){
            return getToken(messaging,{vapidKey}).then((token)=>{
                return token
            })
        }else{
            throw new Error('Permission not granted')
        }
    }).catch((error)=>{
        console.log("Error getting FCM token", error)
        throw error
    })
}

export const onMessageListener = () =>{
    return new Promise((resolve)=>{
        onMessage(messaging,(payload)=>{
            resolve(payload)
        })
    })
}

export const onTokenRefresh = (messaging, updateTokenCallback) => {
    messaging.onTokenRefresh(async () => {
        try {
            const newToken = await getToken(messaging, { vapidKey });
            console.log("New FCM Token:", newToken);
            updateTokenCallback(newToken); // Update your app state with the new token
        } catch (error) {
            console.error("Error retrieving new FCM token:", error);
        }
    });
};