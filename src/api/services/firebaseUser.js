const admin = require("firebase-admin");

const userServiceAccount = require("./files/ferriuser-1621914723147-firebase-adminsdk-bb62c-21da48e3f1.json");

// add your firebase db url here
const FIREBASE_DATABASE_URL =
  "https://ferriuser-1621914723147-default-rtdb.firebaseio.com";


admin.initializeApp({
  credential: admin.credential.cert(userServiceAccount),
  databaseURL: FIREBASE_DATABASE_URL,
});

const firebaseUser = {};

firebaseUser.sendMulticastNotification = function (payload) {
  try {

    const info_popup = {
      heading: payload.title,
      body: payload.body,
      imgurl: payload.picture
    }
    const message = {
      tokens: payload.tokens,
      data: {
        title: payload.title,
        message: payload.body,
        info_popup: JSON.stringify(info_popup)
      },
    };

    console.log("message",message);
    
    return admin.messaging().sendMulticast(message);
  } catch (err) {
    console.log("err", err)
  }
}
module.exports = firebaseUser;