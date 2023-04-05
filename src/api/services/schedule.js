const _ = require("lodash");

const scheduleLib = require("node-schedule");
const firebaseUser = require("./firebaseUser");
const User = require("../models/user.model");
const ScheduledNotification = require("../models/scheduledNotification.model");
const schedule = {};

schedule.getJobs = function () {
  return scheduleLib.scheduledJobs;
};

schedule.createSchedule = async function (data) {
  try {
    const scheduledNotification = new ScheduledNotification({
      to: data.to,
      time: data.time,
      days: data.days,
      user_type: data.user_type,
      notification: data.notification,
      message_type: data.message_type,
      schedule: data.schedule
      // notification: {
      //   title: data.title,
      //   body: data.body,
      // },
    });

    await scheduledNotification.save();

    const dayOfWeek = data.days.join(",");
    const timeToSent = data.time.split(":");
    const hours = timeToSent[0];
    const minutes = timeToSent[1];

    const scheduleId = scheduledNotification._id.toString();
    const scheduleTimeout = `${minutes} ${hours} * * ${dayOfWeek}`;

    scheduleLib.scheduleJob(scheduleId, scheduleTimeout, async () => {
      const users = await User.find({ status: true, is_deleted: false, device_token: { "$nin": [null, ""] } }, "device_token");

      const chunks = _.chunk(users, 500);


      const promises = chunks.map((u) => {
        const tokens = [];

        u.forEach((item) => {
          if (item.device_token) {
            tokens.push(item.device_token);
          }
        });

        const payload = {
          tokens,
          title: data.notification.title,
          body: data.notification.body,
          picture: data.notification.picture,
        };
        return firebaseUser.sendMulticastNotification(payload);
      });

      const getsendData = await Promise.all(promises);
      if (getsendData) {
        const getSchNotify = await ScheduledNotification.findById(scheduleId);
        if (getSchNotify) {
          getsendData.forEach(async function (r) {
            //update
            const successCount = getSchNotify.send_total.success_count;
            const failedCount = getSchNotify.send_total.failed_count;
            const update = {
              send_total: {
                success_count: (successCount) ? (successCount + r.successCount) : r.successCount,
                failed_count: (failedCount) ? (failedCount + r.successCount) : r.failureCount
              }
            }
            return await ScheduledNotification.updateOne({ _id: scheduleId }, update);
          });

        }
      }
    });
  } catch (e) {

    console.log("asdasd", e)
    throw e;
  }
};

schedule.reSchedule = async function () {
  try {
    const scheduledNotifications = await ScheduledNotification.find({ to: 'to_all' });

    scheduledNotifications.forEach((scheduledNotification) => {
      const dayOfWeek = scheduledNotification.days.join(",");
      const timeToSent = scheduledNotification.time.split(":");
      const hours = timeToSent[0];
      const minutes = timeToSent[1];

      const scheduleId = scheduledNotification._id.toString();
      const scheduleTimeout = `${minutes} ${hours} * * ${dayOfWeek}`;

      scheduleLib.scheduleJob(scheduleId, scheduleTimeout, async () => {
        const users = await User.find({ status: true, is_deleted: false, device_token: { "$nin": [null, ""] } }, "device_token");

        const chunks = _.chunk(users, 500);

        const promises = chunks.map((u) => {
          const tokens = [];

          u.forEach((item) => {
            if (item.device_token) {
              tokens.push(item.device_token);
            }
          });

          const payload = {
            tokens,
            title: scheduledNotification.notification.title,
            body: scheduledNotification.notification.body,
            picture: scheduledNotification.notification.picture,
          };
          return firebaseUser.sendMulticastNotification(payload);
        });

        const getsendData = await Promise.all(promises);

        if (getsendData) {
          const getSchNotify = await ScheduledNotification.findById(scheduleId);
          if (getSchNotify) {
            getsendData.forEach(async function (r) {
              //update
              const successCount = getSchNotify.send_total.success_count;
              const failedCount = getSchNotify.send_total.failed_count;
              const update = {
                send_total: {
                  success_count: (successCount) ? (successCount + r.successCount) : r.successCount,
                  failed_count: (failedCount) ? (failedCount + r.successCount) : r.failureCount
                }
              }
              return await ScheduledNotification.updateOne({ _id: scheduleId }, update);
            });

          }
        }

      });
    });
  } catch (e) {
    throw e;
  }
};

module.exports = schedule;