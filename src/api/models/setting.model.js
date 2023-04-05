const mongoose = require("mongoose");
const httpStatus = require("http-status");
// const mongoosePaginate = require('mongoose-paginate-v2');
// const moment = require('moment-timezone');

const s3 = require("../../config/s3");
const uuidv4 = require("uuid/v4");
/**
 * Bus type Schema
 * @private
 */
const settingSchema = new mongoose.Schema(
  {
    general: {
      name: { type: String, index: true },
      logo: { type: String, default: "public/images/nologo.png", index: true }, //public/images/nologo.png
      email: { type: String, default: "", index: true },
      address: { type: String, default: "", index: true },
      phone: { type: String, default: "", index: true },
      google_key: { type: String, default: "", index: true },
      tax: { type: String, default: "0" },
      fee: { type: String, default: "0" },
    },
    smtp: {
      is_production: { type: Boolean, default: false },
      username: { type: String, default: "", index: true },
      host: { type: String, default: "", index: true },
      port: { type: String, default: "", index: true },
      password: { type: String, default: "", index: true },
      encryption: { type: String, default: "tls", index: true },
      email: { type: String, default: "", index: true },
      name: { type: String, default: "", index: true },
      type: { type: String, default: "", index: true },
    },
    sms: {
      is_production: { type: Boolean, default: false },
      senderId: { type: String, default: "", index: true },
      username: { type: String, default: "", index: true },
      password: { type: String, default: "", index: true },
      apiKey: { type: String, default: "", index: true },
    },
    s3: {
      access_key: { type: String, default: "", index: true },
      secret_key: { type: String, default: "", index: true },
      region: { type: String, default: "", index: true },
      bucket: { type: String, default: "", index: true },
    },
    payments: {
      is_production: { type: Boolean, default: false },
      key: { type: String, default: "", index: true },
      secret: { type: String, default: "", index: true },
      text_name: { type: String, default: "", index: true },
      logo: { type: String, default: "", index: true }, //public/images/nologo.png
      theme_color: { type: String, default: "", index: true },
      currency: { type: String, default: "INR", index: true },
      name: { type: String, default: "", index: true },
      payment_capture: { type: String, default: "", index: true },
      email: { type: String, default: "", index: true },
      contact: { type: String, default: "", index: true },
    },
    notifications: {
      customer_secret_key: { type: String, default: "", index: true },
      driver_secret_key: { type: String, default: "", index: true },
    },
    terms: { type: String, index: true, default: "" },
    referral_policy: { type: String, index: true },
    cancellation_policy: { type: String, index: true },
    refunds: {
      type: { type: String, default: "percentage" },
      amount: { type: Number, default: 0 },
      contents: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

settingSchema.statics = {
  async logoUpdate(settingId, image, FolderName, type) {
    const settingexists = await this.findById(settingId).exec();
    if (type == "general") {
      if (this.isValidBase64(settingexists.general.logo)) {
        await s3.imageDelete(settingexists.general.logo, FolderName);
        const logo = await s3.imageUpload(
          image,
          `logo_general_${uuidv4()}`,
          FolderName
        );
        return logo;
      } else if (
        settingexists.general.logo == "" ||
        settingexists.general.logo == null
      ) {
        const logo = await s3.imageUpload(
          image,
          `logo_general_${uuidv4()}`,
          FolderName
        );
        return logo;
      }
    } else if (type == "payments") {
      if (this.isValidBase64(settingexists.payments.logo)) {
        await s3.imageDelete(settingexists.payments.logo, FolderName);
        const logo = await s3.imageUpload(
          image,
          `logo_general_${uuidv4()}`,
          FolderName
        );
        return logo;
      } else if (
        settingexists.payments.logo == "" ||
        settingexists.payments.logo == null
      ) {
        const logo = await s3.imageUpload(
          image,
          `logo_general_${uuidv4()}`,
          FolderName
        );
        return logo;
      }
    }
  },
  transFormSingleData(data, type) {
    if (type == "general") {
      return {
        id: data._id,
        name: data.general.name,
        logo: data.general.logo,
        email: data.general.email,
        address: data.general.address,
        phone: data.general.phone,
        google_key: data.general.google_key,
        tax: parseFloat(data.general.tax),
        fee: parseFloat(data.general.fee),
      };
    } else if (type == "sms") {
      return {
        id: data._id,
        is_production: data.sms.is_production,
        senderId: data.sms.senderId,
        username: data.sms.username,
        password: data.sms.password,
        apiKey: data.sms.apiKey,
      };
    } else if (type == "payments") {
      return {
        id: data._id,
        is_production: data.payments.is_production,
        key: data.payments.key,
        secret: data.payments.secret,
        logo: data.payments.logo,
        text_name: data.payments.text_name,
        theme_color: data.payments.theme_color,
        email: data.payments.email,
        name: data.payments.name,
        contact: data.payments.contact,
        currency: data.payments.currency,
        payment_capture: data.payments.payment_capture,
      };
    } else if (type == "aws") {
      return {
        id: data._id,
        access_key: data.s3.access_key,
        secret_key: data.s3.secret_key,
        region: data.s3.region,
        bucket: data.s3.bucket,
      };
    } else if (type == "smtp") {
      return {
        id: data._id,
        is_production: data.smtp.is_production,
        type: data.smtp.type,
        username: data.smtp.username,
        host: data.smtp.host,
        port: data.smtp.port,
        encryption: data.smtp.encryption,
        password: data.smtp.password,
      };
    } else if (type == "notifications") {
      return {
        id: data._id,
        customer_secret_key: data.notifications.customer_secret_key,
        driver_secret_key: data.notifications.driver_secret_key,
      };
    } else if (type == "terms") {
      return {
        id: data._id,
        terms: data.terms,
        type: "terms",
      };
    } else if (type == "refunds") {
      return {
        id: data._id,
        type: data.refunds.type,
        amount: data.refunds.amount,
        contents: data.refunds.contents,
      };
    }
  },
  async getrefunds() {
    const getrefunds = await this.findOne({}, "refunds").lean();
    return getrefunds;
  },
  async findNotifySettings() {
    const getsetting = await this.findOne({}, "notifications").limit(1).lean();
    return getsetting;
  },
  isValidURL(str) {
    const regex =
      /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (!regex.test(str)) {
      return false;
    }
    return true;
  },
  isValidBase64(str) {
    const regex =
      /^data:image\/(?:gif|png|jpeg|jpg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g;

    if (regex.test(str)) {
      return true;
    }
    return false;
  },
};

module.exports = mongoose.model("Setting", settingSchema);
