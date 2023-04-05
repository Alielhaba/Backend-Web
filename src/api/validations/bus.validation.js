const Joi = require('joi');
const Bus = require('../models/bus.model');

module.exports = {

  // GET /v1/buses
  listBuses: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      type: Joi.string(),
      name:Joi.string(),
      reg_no: Joi.string(),
      max_seats: Joi.string(),
      status: Joi.string(),
      // certificate_registration: Joi.string(),
      // certificate_pollution: Joi.string(),
      // certification_insurance: Joi.string(),
      // certificate_fitness: Joi.string(),
      // certificate_permit: Joi.string(),
    },
  },

  // POST /v1/buses
  createBuses: {
    body: {
      bustypeId: Joi.string(),
      name:Joi.string(),
      reg_no: Joi.string(),
      model_no: Joi.string(),
      brand: Joi.string(),
      chassis_no: Joi.string(),
      max_seats: Joi.string(),
      status: Joi.boolean(),
      // certificate_registration: Joi.string(),
      // certificate_pollution: Joi.string(),
      // certification_insurance: Joi.string(),
      // certificate_fitness: Joi.string(),
      // certificate_permit: Joi.string(),
    },
  },


  // PATCH /v1/buses/:busId
  updateBuses: {
    body: {
      bustypeId: Joi.string(),
      name:Joi.string(),
      reg_no: Joi.string(),
      model_no: Joi.string(),
      brand: Joi.string(),
      chassis_no: Joi.string(),
      max_seats: Joi.string(),
      status: Joi.boolean(),
      // certificate_registration: Joi.string(),
      // certificate_pollution: Joi.string(),
      // certification_insurance: Joi.string(),
      // certificate_fitness: Joi.string(),
      // certificate_permit: Joi.string(),
    },
  },
};
