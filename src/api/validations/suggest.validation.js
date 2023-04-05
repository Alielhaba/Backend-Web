const Joi = require("joi");

module.exports = {
  
  // GET /v1/roles
  listSuggests: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string()
    },
  },

}
