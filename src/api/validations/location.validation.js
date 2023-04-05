const Joi = require('joi');
const Location = require('../models/location.model');

module.exports = {

  // GET /v1/locations
  listLocations: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      title: Joi.string(),
      location: Joi.object(),
      city:Joi.string(),
      state:Joi.string(),
      satus:Joi.number(),
    },
  },

  // POST /v1/locations
  createLocation: {
    body: {
      title: Joi.string().required(),
      location: Joi.object(),
      city:Joi.string(),
      state:Joi.string(),
      satus:Joi.number(),
    },
  },

  // PUT /v1/locations/:locationId
  replaceLocation: {
    body: {
      title: Joi.string(),
      location: Joi.object(),
      city:Joi.string(),
      state:Joi.string(),
      satus:Joi.number(),
    },
    params: {
      locationId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /v1/locations/:locationId
  updateLocation: {
    body: {
      title: Joi.string().required(),
      location: Joi.object(),
      city:Joi.string(),
      state:Joi.string(),
      satus:Joi.number(),
    },
    params: {
      locationId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
