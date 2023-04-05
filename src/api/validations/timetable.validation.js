const Joi = require('joi');
const TimeTable = require('../models/timetable.model');

module.exports = {

  // GET /v1/timetable
  listTimeTable: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      direction: Joi.string(),
      every: Joi.array(),
      time: Joi.string(),
      status: Joi.boolean(),
    },
  },

  // POST /v1/timetable
  createTimeTable: {
    body: {
      busId: Joi.string(),
     // routeId:Joi.object(),
      direction: Joi.string(),
      every: Joi.array(),
      time: Joi.string(),
      status: Joi.boolean(),
    },
  },


  // PATCH /v1/timetable/:timetableId
  updateTimeTable: {
    body: {
      busId: Joi.string(),
    //  routeId:Joi.object(),
      direction: Joi.string(),
      every: Joi.array(),
      time: Joi.string(),
      status: Joi.boolean(),
    },
  },
};
