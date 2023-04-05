const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/notification.controller');
const {
    authorize,
    LOGGED_USER,
    getAuth
  } = require('../../middlewares/auth');

  
const router = express.Router();


router
  .route('/search')
  .get(getAuth('notifications'), controller.list);

router
  .route('/')
  .post(getAuth('notifications'), controller.create);

  router
  .route('/:id')
//   .get(getAuth('locations'), controller.get)
//   /**
//   * update the single location
//   * */
//   .patch(getAuth('locations'), validate(updateLocation), controller.update)
// /**
//   * delete  the single location
//   * */
  .delete(getAuth('notifications'), controller.remove);



  module.exports = router;
