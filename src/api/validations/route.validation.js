const Joi = require('joi');
const Route = require('../models/route.model');

module.exports = {

  // GET /v1/route
  listRoute: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      title: Joi.string(),
      status: Joi.string(),
    },
  },

  // POST /v1/route
  createRoute: {
    body: {
    //  routeId: Joi.string(),
      title: Joi.string(),
      status: Joi.boolean(),
    },
  },


  // PATCH /v1/route/:routeId
  updateRoute: {
    body: {
      routeId: Joi.string(),
      title: Joi.string(),
      status: Joi.boolean(),
    },
  },
};
