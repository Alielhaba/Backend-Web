const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/suggest.controller');
const {
  authorize,
  getAuth,
  ADMIN,
  isAdmin,
} = require('../../middlewares/auth');

const {
  listSuggests,
} = require('../../validations/suggest.validation');



const router = express.Router();


router
  .route('/search')
  .get(getAuth('suggests'), validate(listSuggests),controller.list);

  router  
  .route('/:suggestId')

  .get(getAuth('suggests'), controller.get)


  module.exports = router;
