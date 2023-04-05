const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/bus.controller');
const {
  authorize,
  getAuth,
  LOGGED_USER,
} = require('../../middlewares/auth');
const {
  listBuses,
  createBuses,
  updateBuses,
} = require('../../validations/bus.validation');
const multer = require('multer');

const upload = multer({});


const router = express.Router();


router
.route("/route")
.get(controller.loadByRoute);


router
  .route('/')
  .get(getAuth('buses'), controller.load)
  .post(getAuth('buses'), validate(createBuses), controller.create);

  

  router
  .route('/search')
  .get(getAuth('buses'), validate(listBuses),controller.list);


router
  .route('/:busId')

  .get(getAuth('buses'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('buses'), validate(updateBuses), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('buses'), controller.remove);

router
  .route('/:busId/:document_type')
  .patch(getAuth('buses'), validate(updateBuses), upload.single('pic'), controller.uploadDocument);


module.exports = router;
