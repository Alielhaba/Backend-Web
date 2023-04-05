const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Route = require("../models/route.model");
const RouteStop = require("../models/routeStop.model");
const RouteDetail = require("../models/routeDetail.model");
const s3 = require("../../config/s3");
const base64Img = require("base64-img");
const faker = require("../helpers/faker");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");
const mongoose = require('mongoose');


exports.testData = (req, res) => {
    const d = faker.seedDrivers("123456");
    res.status(httpStatus.OK);
    res.json({ d });
};

exports.load = async(req, res) => {
    try {
        const route = await Route.find({ status: true }).sort({ title: 1 });
        res.status(httpStatus.OK);
        res.json({
            message: "stop load successfully.",
            data: Route.transformOptions(route),
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

exports.loadStops = async(req, res) => {
    try {
        const { routeId } = req.params;
        const getRouteStops = await RouteStop.findOne({ routeId }).lean();

        console.log("getRouteStops", getRouteStops.stops);

        res.status(httpStatus.OK);
        res.json({
            message: "stop load successfully.",
            data: getRouteStops.stops,
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

exports.search = async(req, res, next) => {
    try {
        const { search } = req.params;
        const condition = search ? {
            title: { $regex: `(\s+${search}|^${search})`, $options: 'i' },
            status: true
        } : { status: true };
        const result = await Route.find(condition).lean();

        res.json({ total_count: result.length, items: Route.formatRoute(result) });
    } catch (error) {
        next(error);
    }
};



/**
 * Get route by locationId
 * @public
 */
exports.getLocationRoute = async(req, res) => {
    try {
        if (req.params.locationId) {
            console.log("getLocationRoute", req.params.locationId);
            const route = await Route.find({
                locationId: req.params.locationId,
                status: true,
            }).sort({ _id: -1 });
            res.status(httpStatus.OK);
            res.json({
                message: "stop load successfully.",
                data: Route.transformOptions(route),
                status: true,
            });
        } else {
            res.json({
                message: "locationId not found.",
                status: false,
            });
        }
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Get route
 * @public
 */
exports.get = async(req, res) => {
    try {
        const route = await Route.findById(req.params.routeId)
            .populate({
                path: "routestops",
                select: "stops",
                // populate: { path: "locationId", select: "location title type" }
            })
            //  .populate({ path: "locationId", select: "location title type" })
            // .populate({
            //   path: "busId",
            //   select: "name model_no brand",
            //   populate: { path: "bustypeId", select: "name max_seats" },
            // })
            .lean();
        res.status(httpStatus.OK);
        res.json({
            message: "Single route successfully.",
            data: Route.transFormSingleData(route),
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
exports.create = async(req, res, next) => {
    try {
        const { title, stops, status } = req.body;
        const route = await new Route({
            title,
            status
        }).save();
        if (route) {
            const routedetailId = await RouteStop.insertRouteStop(stops, route._id);
            console.log("routedetailId", routedetailId);

            res.status(httpStatus.CREATED);
            return res.json({
                status: true,
                message: "route create successfully",
                data: route,
            });
        }
    } catch (error) {
        return next(error);
    }
};

/**
 * Update existing routes
 * @public
 */

exports.update = async(req, res, next) => {
    const session = await mongoose.startSession();
    try {
        const { title, stops, status } = req.body;
        // Start session
        await session.startTransaction();
        const routeexists = await Route.findById(req.params.routeId).exec();
        if (routeexists) {
            const objUpdate = {
                title,
                status
            };
            const updateroute = await Route.findByIdAndUpdate(
                req.params.routeId, {
                    $set: objUpdate,
                }, {
                    new: true,
                }
            );
            if (updateroute) {
                await RouteStop.updateRouteStop(stops, req.params.routeId);
                // finish transcation
                await session.commitTransaction();
                session.endSession();

                res.status(httpStatus.CREATED);
                return res.json({
                    status: true,
                    message: "route updated successfully",
                    data: updateroute,
                });
            }
        } else {
            // finish transcation
            await session.commitTransaction();
            session.endSession();
            res.status(httpStatus.OK);
            res.json({
                status: true,
                message: "No route found.",
            });
        }
    } catch (error) {
        console.log("error", error);
        await session.abortTransaction();
        session.endSession();
        return next(error);
    }
};

exports.status = async(req, res, next) => {
    try {
        const { status } = req.body;
        const update = await Route.updateOne({ _id: req.params.routeId }, { status: status == "Active" ? "true" : "false" });
        if (update.n > 0) {
            res.json({
                message: `status now is ${status}.`,
                status: true,
            });
        } else {
            res.json({
                message: `updated failed.`,
                status: false,
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get bus list
 * @public
 */
exports.list = async(req, res, next) => {
    try {
        const condition = req.query.global_search ? {
            $or: [{
                    title: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
                // { max_seats: { $regex: new RegExp(req.query.global_search), $options: 'i' } },
                // {layout : { $regex: new RegExp(req.query.global_search), $options: 'i' } },
                { status: req.query.global_search != "inactive" },
                // { last_seat: req.query.global_search != false},
            ],
        } : {};

        let sort = {};
        if (!req.query.sort) {
            sort = { _id: -1 };
        } else {
            const data = JSON.parse(req.query.sort);
            sort = {
                [data.name]: data.order != "none" ? data.order : "asc"
            };
        }

        const paginationoptions = {
            page: req.query.page || 1,
            limit: req.query.per_page || 10,
            collation: { locale: "en" },
            customLabels: {
                totalDocs: "totalRecords",
                docs: "routes",
            },
            sort,
            populate: [{ path: "routestops", select: "stops" }],
            lean: true,
        };

        const result = await Route.paginate(condition, paginationoptions);
        result.routes = Route.transformData(result.routes);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};




/**
 * Delete bus
 * @public
 */
exports.remove = (req, res, next) => {
    Route.deleteOne({
            _id: req.params.routeId,
        })
        .then(() =>
            RouteDetail.deleteOne({
                routeId: req.params.routeId,
            }).then(() => {
                res.status(httpStatus.OK).json({
                    status: true,
                    message: "Route deleted successfully.",
                });
            })
        )
        .catch(e => next(e));
};

/**
 * Delete route detail
 * @public
 */
exports.removeRouteDetail = (req, res, next) => {
    RouteDetail.exists({ _id: req.params.routeDetailId }).then((response) => {
        if (response) {
            RouteDetail.deleteOne({
                _id: req.params.routeDetailId,
            }).then(() => {
                res
                    .status(httpStatus.OK)
                    .json({
                        status: true,
                        message: "stops deleted successfully.",
                    })
                    .catch(e => next(e));
            });
        }
    });
};