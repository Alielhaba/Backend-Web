const express = require("express");
// const validate = require('express-validation');
const controller = require("../../controllers/refferal.controller");
const {
    authorize,
    deletes3Object,
    getAuth,
} = require("../../middlewares/auth");

const router = express.Router();


router
    .route('/search')
    .get(getAuth('referrals'), controller.list);

router
    .route('/cust')
    .get(getAuth('referrals'), controller.get);


module.exports = router;