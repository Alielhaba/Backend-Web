const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");
const Setting = require("../models/setting.model");
const moment = require("moment-timezone")
const mongoose = require("mongoose")
/**
 * 
 * @returns 
 */
exports.count = async (req, res, next) => {
  try {
    let payment_status = req.params.status;
    let FIRST_MONTH = 1
    let LAST_MONTH = 12
    let TODAY = req.body.start_date //moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    let YEAR_BEFORE = req.body.end_date //moment().subtract(1, 'years').format("YYYY-MM-DD");
    console.log("TODAY", TODAY)
    console.log("YEAR_BEFORE", YEAR_BEFORE)
    const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let condition = {}
    if (payment_status === 'Refunded') {
      condition = {
        payment_status,
        createdAt: { $gte: new Date(YEAR_BEFORE), $lte: new Date(TODAY) },
      }
    } else {
      condition = {
        payment_status,
        createdAt: { $gte: new Date(YEAR_BEFORE), $lte: new Date(TODAY) },
        bookingId: { $in: [null, []] }
      }
    }
  
    const data = await Payment.aggregate([
      {
        $match: condition
      },
      {
        $group: {
          _id: { "year_month": { $substrCP: ["$createdAt", 0, 7] } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year_month": 1 }
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_year: {
            $concat: [
              {
                $arrayElemAt: [MONTHS_ARRAY, {
                  $subtract:
                    [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1]
                }]
              },
              "-",
              { $substrCP: ["$_id.year_month", 0, 4] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          data: { $push: { k: "$month_year", v: "$count" } }
        }
      },
      {
        $addFields: {
          start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
          end_year: { $substrCP: [TODAY, 0, 4] },
          months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
          months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
        }
      },
      {
        $addFields: {
          template_data: {
            $concatArrays: [
              {
                $map: {
                  input: "$months1", as: "m1",
                  in: {
                    count: 0,
                    month_year: {
                      $concat: [{ $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m1", 1] }] }, "-", "$start_year"]
                    }
                  }
                }
              },
              {
                $map: {
                  input: "$months2", as: "m2",
                  in: {
                    count: 0,
                    month_year: {
                      $concat: [{ $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m2", 1] }] }, "-", "$end_year"]
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $addFields: {
          data: {
            $map: {
              input: "$template_data", as: "t",
              in: {
                k: "$$t.month_year",
                v: {
                  $reduce: {
                    input: "$data", initialValue: 0,
                    in: {
                      $cond: [{ $eq: ["$$t.month_year", "$$this.k"] },
                      { $add: ["$$this.v", "$$value"] },
                      { $add: [0, "$$value"] }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          data: { $arrayToObject: "$data" },
          _id: 0
        }
      }
    ])

    res.status(httpStatus.OK);
    res.json({
      message: "payment fetched successfully.",
      data,
      status: true,
    });

  } catch (err) {
    next(err);
  }
}


/**
 * Get booking
 * @public
 */
exports.get = async (req, res) => {
  try {

    res.status(httpStatus.OK);
    res.json({
      message: "payment fetched successfully.",
      data: Payment.transformSingleData(booking),
      status: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};


/**
 * Get booking layout list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    console.log('req.query', req.query.filters)
    const payment_status = Payment.capitalizeFirstLetter(req.query.filters); // refunded | Completed
    const condition = req.query.global_search
      ? {
        $or: [
          {
            name: {
              $regex: new RegExp(req.query.global_search),
              $options: "i",
            },
          },
        ],
        payment_status,
        is_deleted: false
      }
      : {
        payment_status,
        is_deleted: false
      };
    let sort = {};
    if (!req.query.sort) {
      sort = { _id: -1 };
    } else {
      const data = JSON.parse(req.query.sort);
      sort = { [data.name]: data.order != "none" ? data.order : "asc" };
    }

    //    console.log('1212', sort);
    const paginationoptions = {
      page: req.query.page || 1,
      limit: req.query.per_page || 10,
      collation: { locale: "en" },
      customLabels: {
        totalDocs: "totalRecords",
        docs: "payments",
      },
      sort,
      populate: [
        { path: "bookingId", select: "_id pnr_no discount" },
        { path: "userId", select: "_id firstname lastname  phone email gender " },
        { path: "payments", select: "_id orderId payment_status payment_created amount ferriOrderId paymentId" },

      ],
      lean: true,
    };
    //,{path:"userId",select:"_id firstname lastname phone"}
    const result = await Payment.paginate(condition, paginationoptions);
    // console.log("result.bookings", result.bookings);
    const refundssettings = await Setting.getrefunds();
    result.payments = Payment.transformDataLists(result.payments, refundssettings);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
