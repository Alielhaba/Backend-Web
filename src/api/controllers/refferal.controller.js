const UserReferral = require("../models/userReferral.model");



exports.list = async(req, res, next) => {
    try {
        let condition = req.query.global_search ? {
            $or: [
                { 'payment_status': { $regex: new RegExp(req.query.global_search), $options: 'i' } },
                { 'user.firstname': { $regex: new RegExp(req.query.global_search), $options: 'i' } },
            ],
            user_type: 'Customer'
        } : {
            user_type: 'Customer'
        };

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.per_page) || 10;
        let skip = (page - 1) * limit;

        var query = [
            { $match: condition },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    as: 'user',
                    let: { userId: '$userId' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ['$_id', '$$userId']
                                    }]
                                }
                            }
                        },
                        {
                            $project: {
                                firstname: 1,
                                lastname: 1
                            }
                        }
                    ]
                },
            },
            {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: 'users',
                    as: 'refferal',
                    let: { refferalId: '$refferalId' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ['$_id', '$$refferalId']
                                    }]
                                }
                            }
                        },
                        {
                            $project: {
                                firstname: 1,
                                lastname: 1
                            }
                        }
                    ]
                },
            },
            {
                $unwind: "$refferal"
            },
            {
                $group: {
                    _id: "$userId",
                    id: { $sum: 1 },
                    days: { $first: "$days" },
                    amount: { $first: "$amount" },
                    start_date: { $first: { $dateToString: { format: '%Y-%m-%d', date: "$start_date" } } },
                    end_date: { $first: { $dateToString: { format: '%Y-%m-%d', date: "$end_date" } } },
                    pending_amount: { $first: "$pending_amount" },
                    payment_status: { $first: "$payment_status" },
                    createdAt: { $first: { $dateToString: { format: '%Y-%m-%d', date: "$createdAt" } } },
                    user: { $first: "$user" },
                    referral: { $first: "$refferal" },
                }
            },
            {
                $facet: {
                    total: [{
                        $count: 'count',
                    }, ],
                    data: [{
                        $addFields: {
                            _id: '$_id',
                        },
                    }, ],
                },
            },
            {
                $unwind: '$total',
            },
            {
                $project: {
                    referrals: {
                        $slice: [
                            '$data',
                            skip,
                            {
                                $ifNull: [limit, '$total.count'],
                            },
                        ],
                    },
                    page: {
                        $literal: skip / limit + 1,
                    },
                    hasNextPage: {
                        $lt: [{ $multiply: [limit, Number(page)] }, '$total.count'],
                    },
                    totalPages: {
                        $ceil: {
                            $divide: ['$total.count', limit],
                        },
                    },
                    totalRecords: '$total.count',
                },
            },
            // {
            //     $project: {
            //         _id: 1,
            //         userId: 1,
            //         start_date: 1,
            //         end_date: 1,
            //         pending_amount: 1,
            //         payment_status: 1,
            //         days: 1,
            //         user: "$user",
            //         refferal: "$refferal",
            //         createdAt: 1,
            //     }
            // }
        ]
        var myAggregate = await UserReferral.aggregate(query);
        res.json(myAggregate[0]);

    } catch (error) {
        console.log("err ", error);
        next(error);
    }
}


exports.get = async(req, res, next) => {
    try {
        let condition = req.query.global_search ? {
            $or: [
                { 'payment_status': { $regex: new RegExp(req.query.global_search), $options: 'i' } },
                { 'user.firstname': { $regex: new RegExp(req.query.global_search), $options: 'i' } },
            ],
            user_type: 'Customer',
            userId: req.query.userId
        } : {
            user_type: 'Customer',
            userId: req.query.userId
        };

        let sort = {};
        if (!req.query.sort) {
            sort = { createdAt: -1 };
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
                docs: "referrals",
            },
            sort,
            populate: [{ path: "userId", select: "firstname lastname" }, { path: "refferalId", select: "firstname lastname" }], //match: { amount: {$regex:  '(\s+'+req.query.global_search+'|^'+req.query.global_search+')', $options: 'i' } }
            lean: true,
        };

        const result = await UserReferral.paginate(condition, paginationoptions);
        result.referrals = UserReferral.transformData(result.referrals);
        res.json(result);
    } catch (error) {
        console.log("err ", error);
        next(error);
    }
}