const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/booking.controller');
const {
    authorize,
    getAuth
} = require('../../middlewares/auth');

const router = express.Router();


router
.route('/search')
.get(getAuth('bookings'), controller.list)



router
  .route('/:bookingId')

  .get(getAuth('bookings'), controller.get)


module.exports = router;
