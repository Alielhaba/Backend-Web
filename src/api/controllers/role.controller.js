const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Role = require("../models/role.model");
const Resource = require("../models/resource.model");
const { VARIANT_ALSO_NEGOTIATES } = require("http-status");


/**
 * Load user and append to req.
 * @public
 */
 exports.load = async (req, res, next) => {
  try {
    const role = await Role.find({}).sort({name:1});
    res.status(httpStatus.OK);
    res.json({
      message: 'Role Type load data.',
      data: Role.transformOptions(role),
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};



/**
 * Get role
 * @public
 */
exports.get = async (req, res) => {
  try {
    const role = await Role.findById(req.params.roleId);
    const resource = await Resource.find('roles');
    res.status(httpStatus.OK);
    res.json({
      message: "Role fetched successfully.",
      data: Role.transformSingleData(role),
      status: true,
    });
  } catch (error) {
    console.log(error);
    return error;
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
      docs: 'roles',
    },
    sort,
    lean: true,
  };

  const result = await Role.paginate(condition, paginationoptions);
  result.roles = Role.transformData(result.roles)
  res.json({ data: result });
  }catch(error){
    next(error);
  }
}



/**
 * Create new role
 * @public
 */
 exports.create = async (req, res, next) => {
  try {

    const role = new Role(req.body);
    const savedRole = await role.save();
    res.status(httpStatus.CREATED);
    res.json({ message: 'Role created successfully.', status: true });
  } catch (error) {
    next(error);
  }
};




/**
 * Update existing bus type
 * @public
 */
 exports.update =async (req, res, next) => {
  try {
    const updaterole = await Role.findByIdAndUpdate(req.params.roleId,{
      $set: {
        name: req.body.name,
        slug: req.body.slug,
      },
    }, {
      new: true,
    });
    const transformedRole = updaterole.transform();
    res.json({ message: 'Role updated successfully.',data:transformedRole,status:true});
  } catch (error) {
    next(error);
  }
};





/**
 * Delete bus type
 * @public
 */
 exports.remove = (req, res, next) => {

  Role.deleteOne({
    _id: req.params.roleId,
  })
    .then(() => res.status(httpStatus.OK).json({
      status: true,
      message: 'Role deleted successfully.',
    }))
    .catch(e => next(e));
};
