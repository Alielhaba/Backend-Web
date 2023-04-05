const Joi = require('joi');
const Driver = require('../models/driver.model');

module.exports = {

  // GET /v1/drivers
  listDrivers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      firstname: Joi.string(),
      lastname: Joi.string(),
      phone: Joi.string(),
      email: Joi.string(),
      status: Joi.boolean(),
    },
  },

  // POST /v1/drivers
  createDriver: {
    body: {
      adminId: Joi.string(),
      email: Joi.string().email(),
      firstname: Joi.string(),
      lastname: Joi.string(),
      phone: Joi.string(),
      status: Joi.boolean(),
    },
  },


  // PATCH /v1/drivers/:driverId
  updateDriver: {
    body: {
      adminId: Joi.string(),
      email: Joi.string().email(),
      firstname: Joi.string(),
      lastname: Joi.string(),
      phone: Joi.string(),
      status: Joi.boolean(),
    },
    params: {
      driverId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
