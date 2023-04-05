const express = require('express');
const controller = require('../../controllers/setting.controller');

const {
  authorize,
  ADMIN,
  getAuth
} = require('../../middlewares/auth');

const router = express.Router();


router
  .route('/')
  .post(getAuth('settings'), controller.create);

  router
  .route('/:type')
  .get(getAuth('settings'), controller.get)

router
  .route('/:settingId')
  /**
  * update the single location
  * */
  .patch(getAuth('settings'), controller.update)


module.exports = router;
