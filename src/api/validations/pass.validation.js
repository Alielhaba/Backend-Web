const Joi = require('joi');
const Pass = require('../models/pass.model');

module.exports = {

    // GET /v1/route
    listPass: {
        query: {
            page: Joi.number().min(1),
            perPage: Joi.number().min(1).max(100),
            // no_of_rides: Joi.number(),
            // no_of_valid_days: Joi.string(),
            // price_per_km: Joi.string(),
            // discount: Joi.string(),
            // terms: Joi.string(),
            // description: Joi.string(),
            status: Joi.boolean(),
        },
    },

    // POST /v1/route
    createPass: {
        body: {
            no_of_rides: Joi.number(),
            no_of_valid_days: Joi.string(),
            price_per_km: Joi.string(),
            discount: Joi.string(),
            status: Joi.boolean(),
        },
    },


    // PATCH /v1/route/:routeId
    updatePass: {
        body: {
            no_of_rides: Joi.number(),
            no_of_valid_days: Joi.string(),
            price_per_km: Joi.string(),
            discount: Joi.string(),
            status: Joi.boolean(),
        },
    },
};
