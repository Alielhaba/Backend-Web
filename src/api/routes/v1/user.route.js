const express = require("express");
// const validate = require('express-validation');
const controller = require("../../controllers/user.controller");
const {
  authorize,
  deletes3Object,
  getAuth,
} = require("../../middlewares/auth");
// const {
//   listLocations,
//   createLocation,
//   replaceLocation,
//   updateLocation,
// } = require('../../validations/location.validation');

const router = express.Router();



router
  .route("/")
  // .get(getAuth('users'), controller.authLists)
  .post(getAuth("users"), controller.create);

router.route("/search").get(getAuth("users"), controller.list);
router.route("/wallet-histories").get(getAuth("users"), controller.walletHistories);

router.route("/q").get(getAuth("users"), controller.search);

router
  .route("/:userId")
  .get(getAuth("users"), controller.get)
  /**
   * update the single location
   * */
  .patch(getAuth("users"), controller.update)
/**
  * delete  the single location
  * */
 .delete(getAuth('users'), controller.remove);


module.exports = router;
