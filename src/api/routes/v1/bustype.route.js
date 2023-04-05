const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/bustype.controller');
const {
  authorize,
  getAuth,
  LOGGED_USER,
} = require('../../middlewares/auth');
const {
  listBusTypes,
  createBusTypes,
  updateBusTypes,
  replaceBusTypes,
} = require('../../validations/bustype.validation');



const router = express.Router();


router
  .route('/')
  .get(getAuth('bus-types'), controller.load)
  .post(getAuth('bus-types'), validate(createBusTypes), controller.create);

router
  .route('/search')
  .get(getAuth('bus-types'), validate(listBusTypes),controller.list);


router
  .route('/:bustypeId')

  .get(getAuth('bus-types'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('bus-types'), validate(updateBusTypes), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('bus-types'), validate(replaceBusTypes),controller.remove);

module.exports = router;
