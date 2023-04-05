const express = require("express");
// const validate = require('express-validation');
const controller = require("../../controllers/wallet.controller");
const {
    getAuth,
  } = require("../../middlewares/auth");

const router = express.Router();


router
    .route("/")
    .post(getAuth("wallets"), controller.create);

module.exports = router;
