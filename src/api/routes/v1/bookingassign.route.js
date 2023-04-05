const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/bookingassign.controller');
const {
  authorize,
  getAuth
} = require('../../middlewares/auth');

const router = express.Router();




router
  .route('/')
  .post(getAuth('booking-assigns'), controller.create)


router
  .route('/search')
  .get(getAuth('booking-assigns'), controller.list)

router
  .route('/:assignId')

  .get(getAuth('booking-assigns'), controller.get)
  .patch(getAuth('booking-assigns'), controller.update)
  
  .delete (getAuth('booking-assigns'), controller.remove);

module.exports = router;
