const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/buslayout.controller');
const {
  authorize,
  getAuth,
  LOGGED_USER,
} = require('../../middlewares/auth');
const {
  listBusLayouts,
  createBusLayouts,
  updateBusLayouts,
  replaceBusLayouts,
} = require('../../validations/buslayout.validation');


const router = express.Router();

router
  .route('/')
  .get(getAuth('bus-layouts'), controller.load)
  .post(getAuth('bus-layouts'), validate(createBusLayouts), controller.create);

router
  .route('/search')
  .get(getAuth('bus-layouts'), validate(listBusLayouts),controller.list);


router
  .route('/:buslayoutId')

  .get(getAuth('bus-layouts'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('bus-layouts'), validate(updateBusLayouts), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('bus-layouts'), validate(replaceBusLayouts),controller.remove);

module.exports = router;
