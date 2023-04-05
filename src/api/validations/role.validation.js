const Joi = require("joi");

module.exports = {
  
  // GET /v1/roles
  listRoles: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string()
    },
  },

  // POST /v1/roles
  createRoles: {
    body: {
      name: Joi.string()
    },
  },

  // PUT /v1/users/:userId
  replaceRoles: {
    body: {
      name: Joi.string()
    },
    params: {
      roleId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },

  // PATCH /v1/roles/:roleId
  updateRoles: {
    body: {
      name: Joi.string()
    },
    params: {
      roleId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
