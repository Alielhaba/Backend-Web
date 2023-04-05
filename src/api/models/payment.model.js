const mongoose = require("mongoose");
const { omitBy, isNil } = require("lodash");
const mongoosePaginate = require("mongoose-paginate-v2");
const { Schema } = mongoose;
const { ObjectId } = Schema;
const moment = require("moment-timezone");

const PaymentSchema = new Schema(
  {
    bookingId: {
      type: ObjectId,
      ref: "Booking",
      default: null,
    },
    walletId: {
      type: ObjectId,
      ref: "Wallet",
    },
    userId: {
      type: ObjectId,
      ref: "User",
    },
    adminId: {
      type: ObjectId,
      ref: "Admin",
      default:null
    },
    is_deleted: { type: Boolean, default: false },
    title: { type: String, default: "" },
    type: { type: Number, default: 1 }, // 0 credit 1 debit
    ferriOrderId: { type: String, default: "" },
    orderId: { type: String, required: true, index: true },
    paymentId: { type: String, default: "" },
    payment_signature: { type: String, default: "" },
    amount: { type: String, default: "" },
    is_pass: { type: Boolean, default: false, index: true },
    total_pass_amount: { type: Number, default: 0 },
    payment_status: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Processing",
        "Failed",
        "Refunded",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },
    payment_created: { type: Number, default: "" },
    payment_details: { type: Object, default: {} },
    method: { type: String, default: "" },
  },
  { timestamps: true }
);

PaymentSchema.statics = {
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  formattedData(data) {
    let i = 1;
    const selectableItems = [];
    data.forEach((item) => {
      selectableItems.push({
        id: i++,
        title: item.title,
        status: item.type == 0 ? "credit" : "debit",
        type: item.type,
        payment_status: item.payment_status,
        method: item.method ? item.method : "-",
        amount: item.amount,
        createdAt: moment(item.createdAt)
          .tz("Asia/kolkata")
          .format("DD MMM YYYY"),
      });
    });
    return selectableItems;
  },
  transformDataLists(data, refundSetting) {
    let i = 1;
    const selectableItems = [];
    let refund_amount = 0;

    data.forEach((item) => {
      let finalTotalFare = parseInt(item.amount);
      if (refundSetting.refunds) {
        let refundAmount = parseInt(refundSetting.refunds.amount);
        if (refundSetting.refunds.type === "percentage") {
          refund_amount = Math.round(
            finalTotalFare - (finalTotalFare * refundAmount) / 100
          );
        } else if (refundSetting.refunds.type === "number") {
          refund_amount = finalTotalFare - refundAmount;
        }
      }

      selectableItems.push({
        id: i++,
        bookingId: item.bookingId._id,
        booking_pnr: item.bookingId.pnr_no,
        title: item.title,
        is_pass: item.is_pass,
        total_pass_amount: item.total_pass_amount,
        orderId: item.ferriOrderId,
        paymentId: item.paymentId,
        payment_status: item.payment_status,
        amount: finalTotalFare,
        refund_amount: refund_amount,
        method: item.method,
        customer_name: item.userId.firstname + " " + item.userId.lastname,
        customer_phone: item.userId.phone,
        createdAt: moment(item.createdAt)
          .tz("Asia/kolkata")
          .format("DD MMM YYYY"),
      });
    });
    return selectableItems;
  },
};

PaymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Payment", PaymentSchema);
