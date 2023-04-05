const s3 = require("../../config/s3");
const uuidv4 = require("uuid/v4");
var base64Img = require('base64-img');
/**
 * Get store upload
 * @public
 */
exports.store = async(req, res, next) => {
    try {
        const type = req.params.type;
        const { qquuid } = req.body;
        const image = req.files.uploadFileObj.data.toString('base64'); // convert to base64
        const base64 = `data:${req.files.uploadFileObj.mimetype};base64,${image}`;
        //   merge to base64
        const uploaded = await s3.imageUpload(
            base64,
            `${qquuid ? qquuid : uuidv4()}`,
            type
        );

        res.json({
            error: null,
            url: uploaded,
            success: true
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
};


/**
 * Get store upload
 * @public
 */
exports.remove = async(req, res, next) => {
    try {
        const { qquuid } = req.body
        const type = req.params.type
        const uploaded = await s3.imageDelete(qquuid + '.png', type);
        res.json({
            error: `${type} deleted successfully.`,
            url: uploaded,
            success: true,
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}