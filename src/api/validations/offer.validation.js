const Joi = require('joi');
const Offer = require('../models/offer.model');

module.exports = {

    // GET /v1/route
    listOffer: {
        query: {
            page: Joi.number().min(1),
            perPage: Joi.number().min(1).max(100),
            status: Joi.boolean(),
        },
    },

    // POST /v1/route
    createOffer: {
        body: {
            name: Joi.string(),
            code: Joi.string(),
            status: Joi.boolean(),
        },
    },


    // PATCH /v1/route/:routeId
    updateOffer: {
        body: {
            name: Joi.string(),
            code: Joi.string(),
            status: Joi.boolean(),
        },
    },
};
