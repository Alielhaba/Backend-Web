const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/offer.controller');
const {
    authorize,
    ADMIN,
    STAFF,
    LOGGED_USER,
    getAuth,
} = require('../../middlewares/auth');
const {
    listOffer,
    createOffer,
    updateOffer,
} = require('../../validations/offer.validation');

const router = express.Router();


router
    .route('/')
    .post(getAuth('offers'), validate(createOffer), controller.create);

// router
//     .route('/markers')
//     .get(authorize(ADMIN), controller.load);

router
.route('/search')
.get(getAuth('offers'), validate(listOffer), controller.list)

router
    .route('/:offerId')
    .get(getAuth('offers'), controller.get)
    /**
     * update the single location
     * */
    .patch(getAuth('offers'), validate(updateOffer), controller.update)
    /**
     * delete  the single location
     * */

.delete(getAuth('offers'), controller.remove);

module.exports = router;
