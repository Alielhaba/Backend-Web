const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/timetable.controller');
const {
  authorize,
  LOGGED_USER,
  getAuth
} = require('../../middlewares/auth');
const {
  listTimeTable,
  createTimeTable,
  updateTimeTable,
} = require('../../validations/timetable.validation');
const multer = require('multer');

const upload = multer({});


const router = express.Router();

router
  .route('/test')
  .get(controller.testData);

router
  .route('/')
  .get(getAuth('timetables'), validate(listTimeTable), controller.list)
  .post(getAuth('timetables'), validate(createTimeTable), controller.create);

  router
  .route('/:timetableId/status')
  /**
   *  update status
   * **/
   .patch(getAuth('timetables'), controller.status)

router
  .route('/:timetableId')

  .get(getAuth('timetables'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('timetables'), validate(updateTimeTable), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('timetables'), controller.remove);

module.exports = router;
