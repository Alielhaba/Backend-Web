const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Route = require("../models/route.model");
const Offer = require("../models/offer.model");
const RouteDetail = require("../models/routeDetail.model");
const s3 = require("../../config/s3");
const base64Img = require("base64-img");
const faker = require("../helpers/faker");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");
const uuidv4 = require("uuid/v4");

/**
 * Get bus
 * @public
 */
exports.get = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    // console.log(route);
    res.status(httpStatus.OK);
    res.json({
      message: "Single offer successfully.",
      data: offer,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Create new bus
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const {
      adminId,
      routeId,
      name,
      type,
      start_date,
      end_date,
      code,
      discount,
      picture,
      attempt,
      status,
      terms,
    } = req.body;
    const FolderName = process.env.S3_BUCKET_OFFER;
    const saveOffer = {
      adminId,
      routeId : (routeId) || null,
      name,
      start_date,
      end_date,
      code,
      discount,
      type,
      status,
      attempt,
      terms,
    };
    if (picture) {
      saveOffer.picture = await s3.imageUpload(
        picture,
        `offer_${uuidv4()}`,
        FolderName
      );
    }

    const offer = await new Offer(saveOffer).save();
    return res.json({
      status: true,
      message: "offer create successfully",
      data: offer,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: "could not create",
      data: error.message,
    });
  }
};

/**
 * Update existing routes
 * @public
 */

exports.update = async (req, res, next) => {
  try {
    const FolderName = process.env.S3_BUCKET_OFFER;
    const offerexists = await Offer.findById(req.params.offerId).exec();
    if (offerexists) {
      const objUpdate = {
        adminId: req.body.adminId,
        name: req.body.name,
        code: req.body.code,
        start_date:req.body.start_date,
        end_date:req.body.end_date,
        discount: req.body.discount,
        type: req.body.type,
        status: req.body.status,
        attempt:req.body.attempt,
        routeId: (req.body.routeId != '') ? req.body.routeId : null,

      };
  
      if (Offer.isValidBase64(req.body.picture)) {
        await s3.imageDelete(offerexists.picture, FolderName);
        objUpdate.picture = await s3.imageUpload(
          req.body.picture,
          `profile_${uuidv4()}`,
          FolderName
        );
      }
      
      const updateOffer = await Offer.findByIdAndUpdate(
        req.params.offerId,
        {
          $set: objUpdate,
        },
        {
          new: true,
        }
      );
      if (updateOffer) {
        res.status(httpStatus.CREATED);
        return res.json({
          status: true,
          message: "offer updated successfully",
          data: updateOffer,
        });
      }
    } else {
      res.status(httpStatus.OK);
      res.json({
        status: true,
        message: "No offer found.",
      });
    }
  } catch (error) {
    console.log("error", error);
    return next(error);
  }
};

/**
 * Get bus list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const condition = req.query.global_search
      ? {
          $or: [
            {
              name: {
                $regex: new RegExp(req.query.global_search),
                $options: "i",
              },
            },
            {
              code: {
                $regex: new RegExp(req.query.global_search),
                $options: "i",
              },
            },
            { status: req.query.global_search != "inactive" },
          ],
        }
      : {};

    let sort = {};
    if (!req.query.sort) {
      sort = { _id: -1 };
    } else {
      const data = JSON.parse(req.query.sort);
      sort = {
        [data.name]: data.order != "none" ? data.order : "asc",
      };
    }

    //    console.log('1212', sort);
    const paginationoptions = {
      page: req.query.page || 1,
      limit: req.query.per_page || 10,
      collation: { locale: "en" },
      customLabels: {
        totalDocs: "totalRecords",
        docs: "offers",
      },
      sort,
      populate:[
        {path:"routeId",select:"title"},
      ],
    };

    const result = await Offer.paginate(condition, paginationoptions);
    result.offers = Offer.transformData(result.offers);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bus
 * @public
 */
exports.remove = async (req, res, next) => {
  try{
    const FolderName = process.env.S3_BUCKET_BUS;
    if(await Offer.exists({_id:req.params.offerId})){
      const offerexists = await Offer.findOne({_id:req.params.offerId});
      if(Offer.isValidURL(offerexists.picture)){
        await s3.imageDelete(offerexists.picture,FolderName);
      }
      const deleteOffer = await Offer.deleteOne({_id: req.params.offerId});
      if(deleteOffer){
        res.status(httpStatus.OK).json({
          status: true,
          message: "Offer deleted successfully.",
        });
      }
    }
  }catch(err){
    next(err)
  }
  
};
