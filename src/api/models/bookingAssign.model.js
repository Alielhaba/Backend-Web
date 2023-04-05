const mongoose = require("mongoose");
const { omitBy, isNil } = require("lodash");
const { Schema } = mongoose;
const moment = require("moment-timezone");
const { ObjectId } = Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const objectIdToTimestamp = require("objectid-to-timestamp");

const bookingAsignSchema = new Schema(
  {
    adminId: { type: ObjectId, ref: 'Admin', required: false },
    ticketId: { type: ObjectId, ref: 'Ticket' },
    routeId: { type: ObjectId, ref: 'Route', required: true },
    driverId: { type: ObjectId, ref: 'Driver', required: true },
    assistantId: { type: [ObjectId], ref: 'Driver' },
    date_time: { type: Date, index: true },
    status: { type: Boolean, default: true },
    angle:{type:String,default:""},
    location: {
        type: { type: String, default: "Point" },
        address: { type: String, default: "" },
        coordinates: [Number],
    },
    trip_status: { type: String, enum: ['ASSIGNED',"EXPIRED",'STARTED', 'COMPLETED', 'NOTSTARTED', 'RIDING'], default: "ASSIGNED" }

  }, {
  timestamps: true,
})

//assistant


bookingAsignSchema.statics = {
  formatData(item){
    return{
      route:item.routeId,
      trip_status:item.trip_status,
      driver:{
        id:item.driverId._id,
        title:item.driverId.firstname+' '+item.driverId.lastname,
        pageId:objectIdToTimestamp(item.driverId._id)
      },
      date_time:item.date_time,
      assistant:this.formatAssistant(item.assistantId)
    }
  },
  formatAssistant(data){
    const selectableItems = [];
    data.forEach((item) => {
      selectableItems.push({
        id:item._id,
        title:item.firstname+' '+item.lastname,
        pageId:objectIdToTimestamp(item._id)
      })
    });
    return selectableItems;
  },
  async isExistDateTime(route, date_time) {
    const isExists = await this.find({
      routeId: route,
      date_time: {
        $gte: new Date(date_time),
        $lte: new Date(date_time)
      }
    })
    if (isExists.length > 0) {
      return true
    }
    return false
  },
  filterAssistant(data) {
    const selectableItems = [];
    let i = 1;
    data.forEach((item) => {
      selectableItems.push(item.id);
    });
    return selectableItems
  },
  transformDataLists(data) {
    const selectableItems = [];
    let i = 1;
    data.forEach((item) => {
      selectableItems.push({
        id: i++,
        ids:item._id,
        adminId: item.adminId._id,
        admin_name: item.adminId.firstname,
        routeId: item.routeId._id,
        route_name: item.routeId.title,
        driverId: item.driverId._id,
        driver_name: `${item.driverId.firstname} ${item.driverId.lastname} <br> <b>${item.driverId.phone}</b>`,
        date_time: moment(item.date_time).tz('Asia/Kolkata').format('LLL'),
        assistantId: this.convertToHtml(item.assistantId),
        trip_status:item.trip_status,
        location:item.location
      });

    });
    return selectableItems
  },
  convertToHtml(data) {
    let html = '';
    data.forEach((item) => {

      html += `<p>${item.firstname} : ${item.phone}</p>`
    });
    return html;
  }
}

bookingAsignSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("BookingAssign", bookingAsignSchema);
