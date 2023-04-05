const httpStatus = require("http-status");
const Setting = require("../models/setting.model");
const uuidv4 = require("uuid/v4");
const s3 = require("../../config/s3");
/**
 * Get application settings
 * @public
 */
exports.get = async (req, res) => {
  try {
    const settings = await Setting.findOne({}).sort({ _id: -1 }).limit(1);
    res.status(httpStatus.OK);
    res.json({
      message: "setting fetched successfully.",
      data: Setting.transFormSingleData(settings, req.params.type),
      status: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Create new application settings
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { type, general, sms, email, terms, payment, s3 } = req.body;

    if (type == "general") {
      const settingObject = {
        general: {
          name: general.name,
          logo: general.logo,
          email: general.email,
          address: general.address,
          phone: general.phone,
          google_key: general.googlekey,
          tax: general.tax,
          fee: general.fee,
        },
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        data: setting,
        status: true,
      });
    } else if (type == "s3") {
      const settingObject = {
        access_key: s3.access_key,
        secret_key: s3.secret_key,
        region: s3.region,
        bucket: s3.bucket,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        location: setting,
        status: true,
      });
    } else if (type == "email") {
      const settingObject = {
        is_production: email.is_production,
        type: email.type,
        username: email.username,
        host: email.host,
        password: email.password,
        port: email.port,
        encryption: email.encryption,
        email: email.email,
        name: email.name,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        location: setting.email,
        status: true,
      });
    } else if (type == "sms") {
      const settingObject = {
        is_production: sms.is_production,
        senderId: sms.senderId,
        username: email.username,
        password: email.password,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        location: setting.sms,
        status: true,
      });
    } else if (type == "terms") {
      const settingObject = {
        terms,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        location: setting.terms,
        status: true,
      });
    } else if (type == "refunds") {
      const settingObject = {
        refunds,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "refunds created successfully.",
        location: setting.terms,
        status: true,
      });

    } else if (type == "payment") {
      const settingObject = {
        is_production: payment.is_production,
        key: payment.key,
        secret: payment.secret,
        text_name: payment.text_name,
        payment_capture: payment.payment_capture,
        logo: payment.logo,
        contact: payment.contact,
        email: payment.email,
        theme_color: payment.theme_color,
        currency: payment.currency,
        name: payment.name,
      };
      const setting = await new Setting(settingObject).save();
      res.status(httpStatus.CREATED);
      res.json({
        message: "general created successfully.",
        location: setting.terms,
        status: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing Setting
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const { type, general, sms, smtp, terms, payments, s3, notifications,refunds } =
      req.body;

    const FolderName = process.env.S3_BUCKET_SETTINGS;
    if (type == "general") {
      const settingObject = {
        general: {
          name: general.name,
          email: general.email,
          address: general.address,
          phone: general.phone,
          google_key: general.google_key,
          fee: general.fee,
          tax: general.tax,
        },
      };
      settingObject.general.logo = await Setting.logoUpdate(
        req.params.settingId,
        general.logo,
        FolderName,
        type
      ); // upload logo
      // console.log('general.logo',general.logo);
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "aws") {
      const settingObject = {
        s3: {
          access_key: s3.access_key,
          secret_key: s3.secret_key,
          region: s3.region,
          bucket: s3.bucket,
        },
      };
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "s3 settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "smtp") {
      const settingObject = {
        smtp: {
          is_production: smtp.is_production,
          type: smtp.type,
          username: smtp.username,
          host: smtp.host,
          password: smtp.password,
          port: smtp.port,
          encryption: smtp.encryption,
          email: smtp.email,
          name: smtp.name,
        },
      };
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "sms") {
      const settingObject = {
        sms: {
          is_production: sms.is_production,
          senderId: sms.senderId,
          username: sms.username,
          password: sms.password,
          apiKey: sms.apikey,
        },
      };
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "notifications") {
      const settingObject = {
        notifications: {
          customer_secret_key: notifications.customer_secret_key,
          driver_secret_key: notifications.driver_secret_key,
        },
      };

      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "terms") {
      const settingObject = {
        terms,
      };
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    }else if(type == 'refunds'){
      const settingObject = {
        refunds:{
          type: refunds.type,
          amount:refunds.amount,
          contents:refunds.contents
        }
      };
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "refunds updated successfully.",
        data: transformedUsers,
        status: true,
      });
    } else if (type == "payments") {
      const settingObject = {
        payments: {
          is_production: payments.is_production,
          key: payments.key,
          secret: payments.secret,
          text_name: payments.text_name,
          payment_capture: payments.payment_capture,
          contact: payments.contact,
          email: payments.email,
          theme_color: payments.theme_color,
          currency: payments.currency,
          name: payments.name,
        },
      };
      settingObject.payments.logo = await Setting.logoUpdate(
        req.params.settingId,
        payments.logo,
        FolderName,
        type
      ); // upload logo
      const updatesettings = await Setting.findByIdAndUpdate(
        req.params.settingId,
        {
          $set: settingObject,
        },
        {
          new: true,
        }
      );

      const transformedUsers = Setting.transFormSingleData(
        updatesettings,
        type
      );
      res.json({
        message: "settings updated successfully.",
        data: transformedUsers,
        status: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
