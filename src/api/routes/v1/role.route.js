const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/role.controller');
const {
  authorize,
  getAuth,
  ADMIN,
  LOGGED_USER,
  isAdmin,
} = require('../../middlewares/auth');
const {
  listRoles,
  createRoles,
  updateRoles,
  replaceRoles,
} = require('../../validations/role.validation');


const router = express.Router();


router
  .route('/')
  .get(getAuth('roles'), controller.load)
  .post(getAuth('roles'), validate(createRoles), controller.create);

router
  .route('/search')
  .get(getAuth('roles'), validate(listRoles),controller.list);


router  
  .route('/:roleId')

  .get(getAuth('roles'), controller.get)
  /**
  * update the single location
  * */
  .patch(getAuth('roles'), validate(updateRoles), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('roles'), validate(replaceRoles),controller.remove);

module.exports = router;
