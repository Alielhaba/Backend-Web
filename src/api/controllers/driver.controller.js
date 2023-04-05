const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Driver = require("../models/driver.model");
const s3 = require("../../config/s3");
const base64Img = require("base64-img");
const faker = require("../helpers/faker");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");
const uuidv4 = require("uuid/v4");
const { BASEURL, port, FULLBASEURL } = require("../../config/vars");
const APIError = require("../utils/APIError");

const mongoose = require("mongoose");

exports.testData = (req, res) => {
    const d = faker.seedDrivers("123456");
    res.status(httpStatus.OK);
    res.json({ d });
};
/**
 * Get user
 * @public
 */
exports.get = async(req, res) => {
    try {
        const driver = await Driver.findById(req.params.driverId);
        res.status(httpStatus.OK);
        res.json({
            message: "Driver get successfully.",
            data: driver.transform(),
            status: true,
        });
    } catch (error) {
        console.log(error);
        throw new APIError(error);
    }
};

/**
 * Load driver and append to req.
 * @public
 */
exports.load = async(req, res, next, id) => {
    try {
        const driver = await Driver.get(id);
        req.locals = {
            driver,
        };
        return next();
    } catch (error) {
        throw new APIError(error);
    }
};


/**
 * Update existing user status
 * @public
 */
exports.status = async(req, res, next) => {
    try {
        const { status, type } = req.body;
        const update = await Driver.updateOne({ _id: req.params.driverId }, { status: status == "Active" ? "true" : "false" });
        if (update.n > 0) {
            res.json({
                message: `${type} status now is ${status}.`,
                status: true,
            });
        } else {
            res.json({
                message: `updated failed.`,
                status: false,
            });
        }
    } catch (error) {
        throw new APIError(error);
    }
};

/**
 *  upload single  documents
 */
exports.uploadDocument = async(req, res, next) => {
    try {
        const { driverId } = req.params;
        const { document_type } = req.body;
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
            const FolderName = process.env.S3_BUCKET_DRIVERDOC;
            const base64Image = req.file.buffer.toString("base64");
            const base64 = `data:${req.file.mimetype};base64,${base64Image}`;
            const s3Dataurl = await s3.imageUpload(
                base64,
                `${driverId}__${document_type}`,
                FolderName
            ); // upload data to aws s3
            if (s3Dataurl) {
                if (document_type == "license") {
                    const update = {
                        document_licence: s3Dataurl,
                    };

                    await Driver.updateOne({
                            _id: driverId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Driver document uploaded successfully.",
                        driver: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else if (document_type == "adhar_card") {
                    const update = {
                        document_adhar_card: s3Dataurl,
                    };

                    await Driver.updateOne({
                            _id: driverId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Driver document uploaded successfully.",
                        driver: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                } else {
                    const update = {
                        document_police_vertification: s3Dataurl,
                    };

                    await Driver.updateOne({
                            _id: driverId,
                        },
                        update
                    );
                    res.status(httpStatus.OK);
                    res.json({
                        message: "Driver document uploaded successfully.",
                        driver: { document_type, pathUrl: s3Dataurl },
                        status: true,
                    });
                }
            } else {
                res.status(httpStatus.NOT_FOUND);
                res.json({
                    message: "Driver document uploaded successfully.",
                    status: false,
                });
            }
        }
    } catch (error) {
        throw new APIError(error);
    }
};

/**
 * Create new driver
 * @public
 */
exports.create = async(req, res, next) => {
    try {
        const {
            adminId,
            firstname,
            lastname,
            email,
            type,
            phone,
            status,
            picture,
            document_licence,
            document_adhar_card,
            document_police_vertification,
        } = req.body;
        const FolderName = process.env.S3_BUCKET_DRIVERDOC;
        const objDriver = {
            adminId,
            firstname,
            lastname,
            email,
            phone,
            status,
            type,
        };
        if (picture) {
            objDriver.picture = await s3.imageUpload(
                picture,
                `profile_${uuidv4()}`,
                FolderName
            );
        }

        if (document_licence) {
            objDriver.document_licence = await s3.imageUpload(
                document_licence,
                `document_licence_${uuidv4()}`,
                FolderName
            );
        }

        if (document_adhar_card) {
            objDriver.document_adhar_card = await s3.imageUpload(
                document_adhar_card,
                `document_adhar_card_${uuidv4()}`,
                FolderName
            );
        }

        if (document_police_vertification) {
            objDriver.document_police_vertification = await s3.imageUpload(
                document_police_vertification,
                `document_police_vertification_${uuidv4()}`,
                FolderName
            );
        }

        const driver = new Driver(objDriver);
        const savedDriver = await driver.save();
        res.status(httpStatus.CREATED);
        res.json({
            message: "Driver created successfully.",
            driver: savedDriver.transform(),
            status: true,
        });
    } catch (error) {
        throw new APIError(Driver.checkDuplicateEmail(error));
    }
};

/**
 * Update existing user
 * @public
 */
exports.update = async(req, res, next) => {
    try {
        const driverexists = await Driver.findById(req.params.driverId).exec();
        const FolderName = process.env.S3_BUCKET_AGENTDOC;
        const objUpdate = {
            adminId: req.body.adminId,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status,
            type: req.body.type,
        };

        if (Driver.isValidBase64(req.body.picture)) {
            await s3.imageDelete(driverexists.picture, FolderName);
            objUpdate.picture = await s3.imageUpload(
                req.body.picture,
                `profile_${uuidv4()}`,
                FolderName
            );
        }

        if (Driver.isValidBase64(req.body.document_licence)) {
            await s3.imageDelete(driverexists.document_licence, FolderName);
            objUpdate.document_licence = await s3.imageUpload(
                req.body.document_licence,
                `document_licence_${uuidv4()}`,
                FolderName
            );
        }

        if (Driver.isValidBase64(req.body.document_adhar_card)) {
            await s3.imageDelete(driverexists.document_adhar_card, FolderName);
            objUpdate.document_adhar_card = await s3.imageUpload(
                req.body.document_adhar_card,
                `document_adhar_card_${uuidv4()}`,
                FolderName
            );
        }

        if (Driver.isValidBase64(req.body.document_police_vertification)) {
            await s3.imageDelete(
                driverexists.document_police_vertification,
                FolderName
            );
            objUpdate.document_police_vertification = await s3.imageUpload(
                req.body.document_police_vertification,
                `document_police_vertification_${uuidv4()}`,
                FolderName
            );
        }

        const updatedrivers = await Driver.findByIdAndUpdate(
            req.params.driverId, {
                $set: objUpdate,
            }, {
                new: true,
            }
        );

        const transformedDrivers = updatedrivers.transform();
        res.status(httpStatus.CREATED);
        res.json({
            message: "Driver update successfully.",
            data: transformedDrivers,
            status: true,
        });
    } catch (error) {
        console.log("error ", error);
        throw new APIError(error);
    }
};

/**
 * Get driver list
 * @public
 */
exports.list = async(req, res, next) => {
    try {
        //  const drivers = await Driver.list(req.query);
        //   console.log(req.query);
        let condition = req.query.global_search ? {
            $or: [{
                    firstname: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
                {
                    lastname: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
                {
                    phone: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
                {
                    type: {
                        $regex: new RegExp(req.query.global_search),
                        $options: "i",
                    },
                },
            ],
            is_deleted: false,
        } : {
            is_deleted: false,
        };

        let sort = {};
        if (!req.query.sort) {
            sort = { _id: -1 };
        } else {
            const data = JSON.parse(req.query.sort);
            sort = {
                [data.name]: data.order != "none" ? data.order : "asc"
            };
        }
        let newquery = {};
        if (req.query.filters) {
            const filtersData = JSON.parse(req.query.filters);
            if (filtersData.type == "simple") {
                if (filtersData.name === "agent_name") {
                    let fullname = filtersData.text.split(" ");
                    newquery = {
                        firstname: {
                            $regex: "(s+" + fullname[0] + "|^" + fullname[0] + ")",
                            $options: "i",
                        },
                        lastname: {
                            $regex: "(s+" + fullname[1] + "|^" + fullname[1] + ")",
                            $options: "i",
                        },
                    };
                } else {
                    condition = {
                        [filtersData.name]: filtersData.text,
                        is_deleted: false,
                    };
                }
            } else if (filtersData.type == "select") {
                condition = {
                    [filtersData.name]: { $in: filtersData.selected_options },
                    is_deleted: false,
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
                docs: "drivers",
            },
            sort,
            populate: {
                path: "adminId",
                select: "firstname lastname",
                match: newquery,
            },
            lean: true,
        };

        const result = await Driver.paginate(condition, paginationoptions);
        // const transformedDrivers = drivers.map(driver => driver.transform());
        // console.log('qweqwe', result);
        result.drivers = Driver.transformData(result.drivers);
        res.json({ data: result });
    } catch (error) {
        throw new APIError(error);
    }
};



exports.search = async(req, res, next) => {
    try {
        const { search, type } = req.query;
        const condition = search ? {
            $or: [{
                    firstname: { $regex: `(\s+${search}|^${search})`, $options: 'i' }
                },
                { lastname: { $regex: new RegExp(search), $options: 'i' } },
                { phone: { $regex: new RegExp(search), $options: 'i' } },
                { email: { $regex: new RegExp(search), $options: 'i' } },
            ],
            type,
            is_deleted: false

        } : { type, is_deleted: false };
        const result = await Driver.find(condition).lean();
        res.json({ total_count: result.length, items: await Driver.formatDriver(result) });
    } catch (error) {
        throw new APIError(error);
    }
};



/**
 * Delete driver
 * @public
 */
exports.remove = async(req, res, next) => {
    try {
        const FolderName = process.env.S3_BUCKET_DRIVERDOC;
        if (await Driver.exists({ _id: req.params.driverId })) {
            const getdriver = await Driver.findOne({ _id: req.params.driverId });
            if (Driver.isValidURL(getdriver.picture)) {
                await s3.imageDelete(driverexists.picture, FolderName);
            }
            if (Driver.isValidURL(getdriver.document_licence)) {
                await s3.imageDelete(driverexists.document_licence, FolderName);
            }
            if (Driver.isValidURL(getdriver.document_adhar_card)) {
                await s3.imageDelete(driverexists.document_adhar_card, FolderName);
            }
            if (Driver.isValidURL(getdriver.document_police_vertification)) {
                await s3.imageDelete(
                    driverexists.document_police_vertification,
                    FolderName
                );
            }

            const deleteDriver = await Driver.deleteOne({ _id: req.params.driverId });
            if (deleteDriver) {
                res.status(httpStatus.OK).json({
                    status: true,
                    message: "Driver deleted successfully.",
                });
            }
        }
    } catch (e) {
        throw new APIError(e);
    }
};