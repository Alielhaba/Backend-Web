const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/location.controller');
const {
  authorize,
  LOGGED_USER,
  getAuth
} = require('../../middlewares/auth');
const {
  listLocations,
  createLocation,
  replaceLocation,
  updateLocation,
} = require('../../validations/location.validation');


const router = express.Router();


router
  .route('/')
  .get(getAuth('locations'), validate(listLocations), controller.list)
  .post(getAuth('locations'), validate(createLocation), controller.create);

  router
  .route('/markers')
  .get(getAuth('locations'), controller.load);


router
  .route('/search')
  .get(getAuth('locations'), controller.search);


router
  .route('/:locationId')
  .get(getAuth('locations'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('locations'), validate(updateLocation), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('locations'), controller.remove);

module.exports = router;
