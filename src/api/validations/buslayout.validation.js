const Joi = require("joi");

module.exports = {
  
  // GET /v1/buslayouts
  listBusLayouts: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      status: Joi.boolean(),
      seat_numbers:Joi.string(),
      layout:Joi.string()
    },
  },

  // POST /v1/buslayouts
  createBusLayouts: {
    body: {
      name: Joi.string(),
      status: Joi.string(),
      seat_numbers:Joi.string(),
      layout:Joi.string()
    },
  },

  // PUT /v1/users/:userId
  replaceBusLayouts: {
    body: {
      name: Joi.string(),
      status: Joi.boolean(),
      seat_numbers:Joi.string(),
      layout:Joi.string()
    },
    params: {
      buslayoutId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },

  // PATCH /v1/buslayouts/:buslayoutId
  updateBusLayouts: {
    body: {
      name: Joi.string(),
      status: Joi.boolean(),
      seat_numbers:Joi.string(),
      layout:Joi.string()
    },
    params: {
      buslayoutId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
