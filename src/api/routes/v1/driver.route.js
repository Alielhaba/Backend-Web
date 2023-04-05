const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/driver.controller');
const {
    authorize,
    getAuth,
    LOGGED_USER,
} = require('../../middlewares/auth');
const {
    listDrivers,
    createDriver,
    updateDriver,
} = require('../../validations/driver.validation');
const multer = require('multer');

const upload = multer({});


const router = express.Router();

router
    .route('/test')
    .get(controller.testData);

router
    .route('/q')

.get(getAuth('drivers'), controller.search);


router
    .route('/')
    .get(getAuth('drivers'), validate(listDrivers), controller.list)
    .post(getAuth('drivers'), validate(createDriver), controller.create);

router
    .route('/:driverId/status')
    /**
     *  update status
     * **/
    .patch(getAuth('drivers'), controller.status)


router
    .route('/:driverId')

.get(getAuth('drivers'), controller.get)
    /**
     * update the single location
     * */
    .patch(getAuth('drivers'), validate(updateDriver), controller.update)
    /**
     * delete  the single location
     * */

.delete(getAuth('drivers'), controller.remove);

router
    .route('/:driverId/document')
    .patch(getAuth('drivers'), validate(updateDriver), upload.single('pic'), controller.uploadDocument);




module.exports = router;