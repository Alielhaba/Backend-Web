const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/auth.controller');
const {
  authorize,
  deletes3Object,
  getAuth,
} = require('../../middlewares/auth');
// const {
//   listLocations,
//   createLocation,
//   replaceLocation,
//   updateLocation,
// } = require('../../validations/location.validation');


const router = express.Router();


router
  .route('/')
  .get(getAuth('agents'), controller.agentLists)
  .post(getAuth('agents'), controller.create);

  
router
.route('/:adminId')

.get(getAuth('agents'), controller.get)
  /**
  * update the single location
  * */
.patch(getAuth('agents'), controller.update)

/**
  * delete  the single location
  * */

 .delete(getAuth('agents'),deletes3Object, controller.remove);

module.exports = router;
