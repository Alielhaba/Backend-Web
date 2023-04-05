const httpStatus = require('http-status');
const Location = require('../models/location.model');

const {
    omit,
} = require('lodash');

const Route = require('../models/route.model');
const RouteDetail = require('../models/routeDetail.model');

exports.load = async(req, res) => {
    try {
        const location = await Location.find({}).sort({ _id: -1 });
        res.status(httpStatus.OK);
        res.json({
            message: "stop load successfully.",
            data: Location.transformLoad(location),
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Get bus
 * @public
 */
exports.get = async(req, res) => {
    try {
        const location = await Location.findById(req.params.locationId);
        res.status(httpStatus.OK);
        res.json({
            message: "stop fetched successfully.",
            data: Location.transformData(location),
            status: true,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};


/**
 * Create new location
 * @public
 */
exports.create = async(req, res, next) => {
    try {
        const {
            title,
            address,
            lat,
            lng,
            city,
            state,
            status,
            type,
            files
        } = req.body;
        const locationObject = {
            title,
            location: {
                type: 'Point',
                address,
                coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            city,
            state,
            type,
            status,
            files
        };
        const location = await new Location(locationObject).save();
        res.status(httpStatus.CREATED);
        res.json({
            message: 'Stop created successfully.',
            location: location.transform(),
            status: true,
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update existing location
 * @public
 */
exports.update = async(req, res, next) => {
    try {
        const updatelocations = await Location.findByIdAndUpdate(req.params.locationId, {
            $set: {
                title: req.body.title,
                location: {
                    type: 'Point',
                    address: req.body.address,
                    coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
                },
                city: req.body.city,
                state: req.body.state,
                status: (req.body.status == '1'),
                files: req.body.files
            },
        }, {
            new: true,
        });
        const transformedUsers = updatelocations.transform();
        res.json({ message: 'Stop updated successfully.', bustype: transformedUsers, status: true });
    } catch (error) {
        next(error);
    }
};


/**
 * Get location list
 * @public
 */
exports.list = async(req, res, next) => {
    try {
        // const locations = await Location.list(req.query);
        // const transformedUsers = locations.map(location => location.transform());
        let condition = req.query.global_search ? {
            $or: [
                { title: { $regex: '(\s+' + req.query.global_search + '|^' + req.query.global_search + ')', $options: 'i' } },
                // { type: req.query.global_search },
            ],
        } : {};

        let sort = {};
        if (!req.query.sort) {
            sort = { _id: -1 };
        } else {
            const data = JSON.parse(req.query.sort);
            sort = {
                [data.name]: (data.order != 'none') ? data.order : 'asc'
            };
        }

        if (req.query.filters) {
            const filtersData = JSON.parse(req.query.filters);
            condition = {
                [filtersData.name]: filtersData.selected_options[0]
            }
        }

        const paginationoptions = {
            page: req.query.page || 1,
            limit: req.query.per_page || 10,
            collation: { locale: 'en' },
            customLabels: {
                totalDocs: 'totalRecords',
                docs: 'locations',
            },
            sort,
            lean: true,
        };

        const result = await Location.paginate(condition, paginationoptions);
        //  console.log('result.locations', result.locations);
        result.locations = Location.transformDataLists(result.locations)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};


exports.search = async(req, res, next) => {
    try {
        const { search, type } = req.query;
        const condition = search ? {
            // $or: [
            title: { $regex: `(\s+${search}|^${search})`, $options: 'i' },
            type,
            // { 'location.address': { $regex: new RegExp(search), $options: 'i' } },
            //  ],

        } : { type: type };
        const result = await Location.find(condition).lean();
        console.log("result", result)
        res.json({ total_count: result.length, items: Location.formatLocation(result) });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete location
 * @public
 */
exports.remove = (req, res, next) => {

    Route.exists({ locationId: req.params.locationId }).then((result) => {
        if (result) {
            RouteDetail.exists({ locationId: req.params.locationId }).then((result2) => {
                if (result2) {
                    res.status(httpStatus.OK).json({
                        status: false,
                        message: 'Remove the stops first!',
                    })
                } else {
                    res.status(httpStatus.OK).json({
                        status: false,
                        message: 'Remove the routes first!',
                    })
                }
            })
        } else {
            Location.deleteOne({ _id: req.params.locationId })
                .then(() => res.status(httpStatus.OK).json({
                    status: true,
                    message: 'stop deleted successfully.',
                }))
                .catch(e => next(e));
        }


    })

};