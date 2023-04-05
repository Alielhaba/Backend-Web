const express = require('express');
const controller = require('../../controllers/helper.controller');
const {
  authorize,
  getAuth,
  LOGGED_USER,
} = require('../../middlewares/auth');


const router = express.Router();


router
  .route('/search')
  .get(getAuth('helpers'), controller.list);


router
  .route('/:helperId')
  .patch(getAuth('helpers'), controller.reply)
  .delete(getAuth('helpers'), controller.remove);


module.exports = router;
