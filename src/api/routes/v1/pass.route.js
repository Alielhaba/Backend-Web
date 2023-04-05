const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/pass.controller');
const {
    authorize,
    getAuth,
    ADMIN,
    STAFF,
    LOGGED_USER,
} = require('../../middlewares/auth');
const {
    listPass,
    createPass,
    updatePass,
} = require('../../validations/pass.validation');


const router = express.Router();


router
    .route('/')
    .post(getAuth('passes'), validate(createPass), controller.create);


    
router
.route('/search')
.get(getAuth('passes'), validate(listPass), controller.list)



router
    .route('/:passId')
    .get(getAuth('passes'), controller.get)
    /**
     * update the single location
     * */
    .patch(getAuth('passes'), validate(updatePass), controller.update)
    /**
     * delete  the single location
     * */

.delete(getAuth('passes'), controller.remove);

module.exports = router;
