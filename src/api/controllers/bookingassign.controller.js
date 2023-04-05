const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const BookingAssign = require("../models/bookingAssign.model");
const Route = require("../models/route.model");
const Listeners = require("../events/Listener");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");
const Driver = require("../models/driver.model")
const moment = require("moment-timezone")
const driverFCM = require("../notifications/driver")
const driverNotification = require("../models/driverNotification.model")



/**
 * Get bus
 * @public
 */
exports.get = async (req, res) => {
    try {
        const getBookingAssign = await BookingAssign.findById(req.params.assignId)
            .populate({ path: "driverId", select: "firstname lastname" })
            .populate({ path: "assistantId", select: "firstname lastname" });
        res.status(httpStatus.OK);
        res.json({
            message: "Booking Assign fetched successfully.",
            data: await BookingAssign.formatData(getBookingAssign),
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};


/**
 * Create new Booking Assign
 * @public
 */
exports.create = async (req, res, next) => {
    try {

        const { adminId, route, driver, assistant, date_time } = req.body;
        console.log("sdasfasf", await BookingAssign.isExistDateTime(route, date_time))
        if (!await BookingAssign.isExistDateTime(route, date_time)) {
            const createObj = {
                routeId: route,
                driverId: driver ? driver.id : null,
                assistantId: await BookingAssign.filterAssistant(assistant),
                date_time:new Date(date_time),
                adminId,
                location: {
                    type: "Point",
                    coordinates: [0, 0]
                }
            }

            const saveBookingAssign = await new BookingAssign(createObj).save()
            if (saveBookingAssign) {
                const getDriver = await Driver.findById(saveBookingAssign.driverId).select("device_token");

                if (getDriver && getDriver.device_token) {
                    const getRoute = await Route.findById(saveBookingAssign.routeId).select('title');
                    const content = `${getRoute.title} : ${moment(saveBookingAssign.date_time).tz('Asia/kolkata').format('LLL')}`
                    driverFCM.DriverNotification(
                        "New Booking Assigned",
                        content,
                        "",
                        getDriver.device_token
                    ); //title,message,data,token
                    driverNotification.create(content, saveBookingAssign.driverId, adminId, {
                        assignId: saveBookingAssign._id,
                        routeId: saveBookingAssign.routeId
                    });

                }

                //  Listeners.eventsListener.emit("UPDATE-TIKCET-STATUS", ticketId,'ASSIGNED'); // event to ASSIGNED ticket to driver
                res.status(httpStatus.OK);
                res.json({
                    message: "Booking Assigned successfully.",
                    data: saveBookingAssign,
                    status: true,
                });

            }
        } else {
            res.status(httpStatus.OK);
            res.json({
                message: "booking Assign already on this route.",
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
exports.list = async (req, res, next) => {
    try {

        let condition = req.query.global_search ?
            {
                $and: [{
                    $or: [{
                        name: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        seat_booked: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        seat_count: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        'bustypeId.name': {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    { status: req.query.global_search != 'inactive' }

                    ],
                },],
            } :
            {};


        let sort = {};
        if (!req.query.sort) {
            sort = { _id: -1 };
        } else {
            const data = JSON.parse(req.query.sort);
            sort = {
                [data.name]: data.order != "none" ? data.order : "asc"
            };
        }


        if (req.query.filters) {
            const filtersData = JSON.parse(req.query.filters);
            if (filtersData.type == "simple") {
                condition = {
                    [filtersData.name]: filtersData.text,
                };

            } else if (filtersData.type == "select") {
                condition = {
                    [filtersData.name]: { $in: filtersData.selected_options },
                };
            }
        }

        //    console.log('1212', sort);
        const paginationoptions = {
            page: req.query.page || 1,
            limit: req.query.per_page || 10,
            collation: { locale: "en" },
            customLabels: {
                totalDocs: "totalRecords",
                docs: "bookingassigns",
            },
            sort,
            populate: [{ path: "adminId", select: 'firstname' },
            { path: "driverId", select: 'firstname lastname phone' },
            { path: "routeId", select: 'title' },
            { path: "assistantId", select: 'firstname lastname phone' },
            ],
            lean: true,
            leanWithId: true,
        };


        const result = await BookingAssign.paginate(condition, paginationoptions);
        result.bookingassigns = await BookingAssign.transformDataLists(result.bookingassigns);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }

}


/**
 * Update new Booking Assign
 * @public
 */
exports.update = async (req, res, next) => {
    try {
        let assignId = req.params.assignId;
        const { adminId, route, driver, assistant, date_time, trip_status } = req.body;
        if (await BookingAssign.exists({ _id: assignId })) {
            const objUpdate = {
                adminId,
                routeId: route,
                driverId: driver ? driver.id : null,
                assistantId: await BookingAssign.filterAssistant(assistant),
                date_time:new Date(date_time),
                adminId,
                trip_status
            }
            const updateBookingAssign = await BookingAssign.findByIdAndUpdate(
                assignId, {
                $set: objUpdate,
            }, {
                new: true,
            }
            );
            if (updateBookingAssign) {
                const getDriver = await Driver.findById(updateBookingAssign.driverId).select("device_token");

                if (getDriver && getDriver.device_token) {
                    const getRoute = await Route.findById(updateBookingAssign.routeId).select('title');
                    const content = `${getRoute.title} : ${moment(updateBookingAssign.date_time).tz('Asia/kolkata').format('LLL')}`
                    driverFCM.DriverNotification(
                        "New Booking Assigned",
                        content,
                        "",
                        getDriver.device_token
                    ); //title,message,data,token
                    driverNotification.create(content, updateBookingAssign.driverId, adminId, {
                        assignId: updateBookingAssign._id,
                        routeId: updateBookingAssign.routeId
                    });
                }
                res.status(httpStatus.OK);
                res.json({
                    status: true,
                    message: "Booking assign updated successfully.",
                    data: updateBookingAssign,
                });
            }
        } else {
            res.status(httpStatus.OK).json({
                status: false,
                message: 'Booking assign update failed.'
            })
        }

    } catch (error) {
        console.log("error", error)
        next(error);
    }

}
/**
* delete assign 
* @public
*/
exports.remove = async (req, res, next) => {
    try {
        const assignId = req.params.assignId
        if (await BookingAssign.exists({ _id: assignId })) {
            const deleteBookingAssign = await BookingAssign.deleteOne({ _id: assignId });
            await driverNotification.remove(assignId);
            if (deleteBookingAssign) {
                res.status(httpStatus.OK).json({
                    status: true,
                    message: 'Booking Assign deleted successfully.'
                })
            }
        } else {
            res.status(httpStatus.OK).json({
                status: false,
                message: 'Booking assign failed.'
            })
        }
    } catch (error) {
        next(error);
    }
}