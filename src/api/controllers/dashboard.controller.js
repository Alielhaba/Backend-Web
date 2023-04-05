const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Driver = require("../models/driver.model");
const HelpSupport = require("../models/helper.model");


exports.countDown = async (req, res, next) => {
  try {
    const getcustomer = await User.countDocuments({ is_deleted: false });
    const getdriver = await Driver.countDocuments({ is_deleted: false });
    const getagent = await Admin.countDocuments({ role:"agents",isAdmin: false });
  const getHelpSupport = await HelpSupport.countDocuments({});
 
    
    res.json({
      status: true,
      data: {
        countCustomer: {
          startVal: 10,
          endVal: getcustomer,
          duration:2000
        },
        countDriver: {
          startVal: 0,
          endVal: getdriver,
          duration:5000
        },
        countAgent: {
          startVal: 0,
          endVal: getagent,
          duration:4000
        },
         countHelp: {
          startVal: 0,
          endVal: getHelpSupport,
          duration:4000
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
