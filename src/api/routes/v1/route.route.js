const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/route.controller');
const {
  authorize,
  ADMIN,
  STAFF,
  LOGGED_USER,
  getAuth
} = require('../../middlewares/auth');
const {
  listRoute,
  createRoute,
  updateRoute,
} = require('../../validations/route.validation');
const multer = require('multer');

const upload = multer({});

const router = express.Router();

router
  .route('/test')
  .get(controller.testData);


router
.route("/stops/:routeId")
.get(controller.loadStops);


router
  .route('/')
  .get(getAuth('routes'), controller.load)

  .post(getAuth('routes'), validate(createRoute), controller.create);

  router
  .route('/:locationId/options')
  .get(getAuth('routes'), controller.getLocationRoute)

  
  router
  .route('/search')
  .get(getAuth('routes'), validate(listRoute), controller.list);

  router
  .route('/find/:search')
  .get(getAuth('routes'), controller.search);

  router
  .route('/:routeId/status')
  /**
   *  update status
   * **/
   .patch(getAuth('routes'), controller.status)

   
router
  .route('/:routeId')

  .get(getAuth('routes'), controller.get)
  .patch(getAuth('routes'), controller.update)
/**
  * delete  the single location
  * */

  .delete(getAuth('routes'), controller.remove);

  router
  .route('/route-detail/:routeDetailId')

  .delete(getAuth('routes'), controller.removeRouteDetail);
  

module.exports = router;
