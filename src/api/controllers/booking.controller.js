const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");

const { VARIANT_ALSO_NEGOTIATES } = require("http-status");




/**
 * Get booking
 * @public
 */
exports.get = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate({ path: "pickupId", select: "_id title" }, )
            .populate({ path: "dropoffId", select: "_id title" })
            .populate({ path: "routeId", select: "_id title" })
            .populate({ path: "busId", select: "_id name reg_no model_no" })
            .populate({ path: "userId", select: "_id firstname lastname phone email gender " })
            .populate({ path: "payments", select: "_id orderId payment_status payment_created amount ferriOrderId paymentId" });

        res.status(httpStatus.OK);
        res.json({
            message: "booking fetched successfully.",
            data: Booking.transformSingleData(booking),
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
exports.list = async(req, res, next) => {
    try {
        // console.log('req.query',req.query.filters)
        const condition = req.query.global_search ?
            {
                $or: [{
                    name: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                }, ],
                travel_status: req.query.filters,
                is_deleted: false
            } :
            {
                travel_status: req.query.filters,
                is_deleted: false
            };
        //"payments.payment_status":'Completed'
        let sort = {};
        if (!req.query.sort) {
            sort = { _id: -1 };
        } else {
            const data = JSON.parse(req.query.sort);
            sort = {
                [data.name]: data.order != "none" ? data.order : "asc" };
        }

        //    console.log('1212', sort);
        const paginationoptions = {
            page: req.query.page || 1,
            limit: req.query.per_page || 10,
            collation: { locale: "en" },
            customLabels: {
                totalDocs: "totalRecords",
                docs: "bookings",
            },
            sort,
            populate: [
                { path: "pickupId", select: "_id title" },
                { path: "dropoffId", select: "_id title" },
                { path: "routeId", select: "_id title" },
                { path: "busId", select: "_id name reg_no model_no" },
                { path: "userId", select: "_id firstname lastname  phone email gender " },
                { path: "payments", select: "_id orderId payment_status payment_created method createdAt amount ferriOrderId paymentId" },

            ],
            lean: true,
        };
        //,{path:"userId",select:"_id firstname lastname phone"}
        const result = await Booking.paginate(condition, paginationoptions);
        // console.log("result.bookings", result.bookings);
        result.bookings = Booking.transformData(result.bookings);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};