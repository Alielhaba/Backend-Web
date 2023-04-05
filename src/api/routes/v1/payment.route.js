const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/payment.controller');
const {
    authorize,
    getAuth
} = require('../../middlewares/auth');

const router = express.Router();


router
.route('/search')
.get(getAuth('payments'), controller.list)

router
.route('/count/:status')
.get(getAuth('payments'), controller.count);

// router
//   .route('/:paymentId')

//   .get(getAuth('payments'), controller.get)


module.exports = router;
