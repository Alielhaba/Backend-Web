const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Listeners = require("../events/Listener");
const Bus = require("../models/bus.model");
const Route = require("../models/route.model");
const TimeTable = require("../models/timetable.model");
const Bus_galleries = require("../models/busGallaries.model");
const s3 = require("../../config/s3");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");
const uuidv4 = require("uuid/v4");


/**
 * Load user and append to req.
 * @public
 */
exports.load = async(req, res, next) => {
    try {
        const bus = await Bus.find({ status: true }).populate("bustypeId");
        res.status(httpStatus.OK);
        res.json({
            message: 'Bus Type load data.',
            data: Bus.transformOptions(bus),
            status: true,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Load user and append to req.
 * @public
 */
exports.loadByRoute = async(req, res, next) => {
    try {

        //const getTimetable = await TimeTable.find({status:true},"busId");
        //const getBusId = getTimetable.map((v) => { return v.busId });
        const getBuses = await Bus.find({}).populate("buslayoutId").lean();
        console.log("getBuses", getBuses);
        res.status(httpStatus.OK);
        res.json({
            message: 'Bus Type load data.',
            data: Bus.transformOptions(getBuses),
            status: true,
        });

    } catch (error) {
        console.log("error", error);
        return next(error);
    }
};

/**
 * Get bus
 * @public
 */
exports.get = async(req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId).populate("adminId").populate("bustypeId");
        res.status(httpStatus.OK);
        res.json({
            message: "Bus fetched successfully.",
            data: Bus.transformData(bus),
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 *  upload single  documents
 */
exports.uploadDocument = async(req, res, next) => {
    try {
        const { busId } = req.params;
        const { document_type } = req.params;
        console.log(busId);
        if (!req.file) {
            res.status(httpStatus.NOT_FOUND);
            res.json({
                message: "no file to uploaded.",
                status: false,
            });
        } else if (req.file.size > 300000) {
            // 2mb size
            res.status(httpStatus.NOT_FOUND);
            res.json({
                message: "file size 3mb limit.",
                status: false,
            });
        } else {
            const FolderName = process.env.S3_BUCKET_BUS;
            const base64Image = req.file.buffer.toString("base64");
            const base64 = `data:${req.file.mimetype};base64,${base64Image}`;
            const s3Dataurl = await s3.imageUpload(
                base64,
                `${busId}__${document_type}`,
                FolderName
            ); // upload data to aws s3
            if (s3Dataurl) {
                if (document_type == "registration") {
                    const update = {
                        certificate_registration: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "Pollution") {
                    const update = {
                        certificate_pollution: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "insurance") {
                    const update = {
                        certificate_insurance: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "fitness") {
                    const update = {
                        certificate_fitness: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "permit") {
                    const update = {
                        certificate_permit: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "picture") {
                    const update = {
                        picture: s3Dataurl,
                    };

                    await Bus.updateOne({
                            _id: busId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "gallery") {
                    const update = {
                        image_url: s3Dataurl,
                    };

                    await Bus_galleries.updateOne({
                            busId: { $eq: busId },
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Bus document uploaded successfully.",
                        bus_gallery: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                }
            } else {
                res.status(httpStatus.NOT_FOUND);
                res.json({
                    message: "Bus document uploaded failed.",
                    status: false,
                });
            }
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Create new bus
 * @public
 */
exports.create = async(req, res, next) => {
    try {
        const {
            bustypeId,
            buslayoutId,
            adminId,
            name,
            brand,
            model_no,
            chassis_no,
            picture,
            reg_no,
            amenities,
            certificate_registration,
            certificate_pollution,
            certificate_insurance,
            certificate_fitness,
            certificate_permit,
            status,
        } = req.body;
        const FolderName = process.env.S3_BUCKET_BUS;
        const objBus = {
            adminId,
            bustypeId,
            buslayoutId,
            name,
            reg_no,
            brand,
            model_no,
            chassis_no,
            status,
            amenities,
        };
        if (picture) {
            objBus.picture = await s3.imageUpload(
                picture,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (certificate_registration) {
            objBus.certificate_registration = await s3.imageUpload(
                certificate_registration,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (certificate_pollution) {
            objBus.certificate_pollution = await s3.imageUpload(
                certificate_pollution,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (certificate_insurance) {
            objBus.certificate_insurance = await s3.imageUpload(
                certificate_insurance,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (certificate_fitness) {
            objBus.certificate_fitness = await s3.imageUpload(
                certificate_fitness,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (certificate_permit) {
            objBus.certificate_permit = await s3.imageUpload(
                certificate_permit,
                `${uuidv4()}`,
                FolderName
            );
        }

        const bus = new Bus(objBus);
        const savedBus = await bus.save();
        Listeners.eventsListener.emit("CREATE-TICKET", savedBus._id); // event to ASSIGNED ticket to driver

        res.status(httpStatus.CREATED);
        return res.json({
            message: 'Bus created successfully.',
            bus: savedBus,
            status: true,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update existing bus
 * @public
 */
exports.update = async(req, res, next) => {
    try {
        const busexists = await Bus.findById(req.params.busId).exec();
        const FolderName = process.env.S3_BUCKET_BUS;
        const objUpdate = {
            adminId: req.body.adminId,
            bustypeId: req.body.bustypeId,
            buslayoutId: req.body.buslayoutId,
            name: req.body.name,
            reg_no: req.body.reg_no,
            status: req.body.status,
            brand: req.body.brand,
            model_no: req.body.model_no,
            chassis_no: req.body.chassis_no,
            amenities: req.body.amenities,
        };

        if (Bus.isValidBase64(req.body.picture)) {
            await s3.imageDelete(busexists.picture, FolderName);
            objUpdate.picture = await s3.imageUpload(
                req.body.picture,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (Bus.isValidBase64(req.body.certificate_registration)) {
            await s3.imageDelete(busexists.certificate_registration, FolderName);
            objUpdate.certificate_registration = await s3.imageUpload(
                req.body.certificate_registration,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (Bus.isValidBase64(req.body.certificate_pollution)) {
            await s3.imageDelete(busexists.certificate_pollution, FolderName);
            objUpdate.certificate_pollution = await s3.imageUpload(
                req.body.certificate_pollution,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (Bus.isValidBase64(req.body.certificate_insurance)) {
            await s3.imageDelete(busexists.certificate_insurance, FolderName);
            objUpdate.certificate_insurance = await s3.imageUpload(
                req.body.certificate_insurance,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (Bus.isValidBase64(req.body.certificate_fitness)) {
            await s3.imageDelete(busexists.certificate_fitness, FolderName);
            objUpdate.certificate_fitness = await s3.imageUpload(
                req.body.certificate_fitness,
                `${uuidv4()}`,
                FolderName
            );
        }

        if (Bus.isValidBase64(req.body.certificate_permit)) {
            await s3.imageDelete(busexists.certificate_permit, FolderName);
            objUpdate.certificate_permit = await s3.imageUpload(
                req.body.certificate_permit,
                `${uuidv4()}`,
                FolderName
            );
        }

        const updatebus = await Bus.findByIdAndUpdate(
            req.params.busId, {
                $set: objUpdate,
            }, {
                new: true,
            }
        );
        if (updatebus) {
            Listeners.eventsListener.emit("UPDATE-TICKET", req.params.busId); // event to ASSIGNED ticket to driver
        }

        const transformedBus = updatebus.transform();
        res.status(httpStatus.OK);
        res.json({
            status: true,
            message: "Bus updated successfully.",
            data: transformedBus,
        });
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

        let condition = req.query.global_search ? {
            $and: [{
                $or: [{
                        name: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    // {
                    //   max_seats: {
                    //     $regex: new RegExp(req.query.global_search),
                    //     $options: "i",
                    //   },
                    // },
                    {
                        reg_no: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        brand: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        model_no: {
                            $regex: new RegExp(req.query.global_search),
                            $options: "i",
                        },
                    },
                    {
                        chassis_no: {
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
            }, ],
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
                docs: "buses",
            },
            sort,
            populate: [{ path: "adminId", select: 'firstname' }, { path: "buslayoutId", select: 'name max_seats' }, { path: "bustypeId", select: 'name' }],
            lean: true,
            leanWithId: true,
        };


        const result = await Bus.paginate(condition, paginationoptions);
        result.buses = Bus.transformDataLists(result.buses);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete bus
 * @public
 */
exports.remove = async(req, res, next) => {
    try {
        const FolderName = process.env.S3_BUCKET_BUS;

        if (await TimeTable.exists({ busId: req.params.busId })) {
            res.status(httpStatus.OK).json({
                status: false,
                message: 'Remove the timetable first!',
            })

        } else if (await Bus.exists({ _id: req.params.busId })) {
            const busexists = await Bus.findOne({ _id: req.params.busId });
            if (Bus.isValidURL(busexists.picture)) {
                await s3.imageDelete(busexists.picture, FolderName);
            }
            if (Bus.isValidURL(busexists.certificate_registration)) {
                await s3.imageDelete(busexists.certificate_registration, FolderName);
            }
            if (Bus.isValidURL(busexists.certificate_pollution)) {
                await s3.imageDelete(busexists.certificate_pollution, FolderName);
            }
            if (Bus.isValidURL(busexists.certification_insurance)) {
                await s3.imageDelete(busexists.certification_insurance, FolderName);
            }
            if (Bus.isValidURL(busexists.certificate_fitness)) {
                await s3.imageDelete(busexists.certificate_fitness, FolderName);
            }
            if (Bus.isValidURL(busexists.certificate_permit)) {
                await s3.imageDelete(busexists.certificate_permit, FolderName);
            }

            Listeners.eventsListener.emit("REMOVE-TICKET", req.params.busId); // event to ASSIGNED ticket to driver
            const deleteBus = await Bus.deleteOne({ _id: req.params.busId });

            if (deleteBus) {

                res.status(httpStatus.OK).json({
                    status: true,
                    message: 'Bus deleted successfully.',
                })
            }
        }

    } catch (e) {
        next(e)
    }
};