const httpStatus = require('http-status');
const {
  omit, isEmpty,
} = require('lodash');
const BusType = require('../models/busType.model');


/**
 * Load user and append to req.
 * @public
 */
 exports.load = async (req, res, next) => {
  try {
    const bustype = await BusType.find({status:true});
    res.status(httpStatus.OK);
    res.json({
      message: 'Bus Type load data.',
      data: BusType.transformOptions(bustype),
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};


/**
 * Get bus type
 * @public
 */
 exports.get = async (req, res) => {
  try {
    const bustype = await BusType.findById(req.params.bustypeId);
    res.status(httpStatus.OK);
    res.json({
      message: 'Bus Type successfully.',
      data: bustype.transform(),
      status: true,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};


/**
 * Create new bus type
 * @public
 */
 exports.create = async (req, res, next) => {
  try {

    const bustype = new BusType(req.body);
    const savedBusType = await bustype.save();
    res.status(httpStatus.CREATED);
    res.json({ message: 'Bus type created successfully.', bustype: savedBusType.transform(), status: true });
  } catch (error) {
    next(error);
  }
};




/**
 * Get bsu layout list
 * @public
 */
 exports.list = async (req, res, next) => {
  try {
    const condition = req.query.global_search
    ?
    {
      $or: [
        { name: { $regex: new RegExp(req.query.global_search), $options: 'i' } },
        { status: req.query.global_search != 'inactive'},
      ],
    }
    : {};

  let sort = {};
  if (!req.query.sort) {
    sort = { _id: -1 };
  } else {
    const data = JSON.parse(req.query.sort);
    sort = { [data.name]: (data.order != 'none') ? data.order : 'asc' };
  }

  //    console.log('1212', sort);
  const paginationoptions = {
    page: req.query.page || 1,
    limit: req.query.per_page || 10,
    collation: { locale: 'en' },
    customLabels: {
      totalDocs: 'totalRecords',
      docs: 'bustypes',
    },
    sort,
    lean: true,
  };

  const result = await BusType.paginate(condition, paginationoptions);
  result.bustypes = BusType.transformData(result.bustypes)
  res.json({ data: result });

  }catch(error){
    next(error);
  }
}




/**
 * Update existing bus type
 * @public
 */
 exports.update =async (req, res, next) => {
  try {
    const updatebustype = await BusType.findByIdAndUpdate(req.params.bustypeId,{
      $set: {
        name: req.body.name,
        status: req.body.status,
      },
    }, {
      new: true,
    });
    const transformedBusType = updatebustype.transform();
    res.json({ message: 'Bus type updated successfully.', bustype:transformedBusType,status:true});
  } catch (error) {
    next(error);
  }
};


/**
 * Delete bus type
 * @public
 */
 exports.remove = (req, res, next) => {

  BusType.remove({
    _id: req.params.bustypeId,
  })
    .then(() => res.status(httpStatus.OK).json({
      status: true,
      message: 'Bus type deleted successfully.',
    }))
    .catch(e => next(e));
};
