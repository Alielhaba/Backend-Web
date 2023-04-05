const  Setting  = require("../models/setting.model");
const FCM = require("fcm-node");


const DriverNotification = async (title, message, data, token) => {
    const getSetting =  await Setting.findNotifySettings();
    const fcm = new FCM(getSetting.notifications.driver_secret_key);

  if (typeof data == "object") {
    var message = {
      to: token,
      data: {
        title: title,
        message: message,
        data: data,
      },
    };
  } else {
    var message = {
      to: token,
      data: {
        title: title,
        message: message,
      },
    };
  }
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("err while Driver :" + err);
    } else {
        console.log("Successfully sent Driver  with response: ", response);
      return response;
     
    }
  });
};

module.exports = {
    DriverNotification
};
