// make bluebird default Promise
/* eslint-disable */
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const mongoose = require('./config/mongoose');
const app = require('./config/express');

const schedule = require("./api/services/schedule");

// open mongoose connection
mongoose.connect();


schedule.reSchedule();

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

// app.use('/v1/buses', busRoute);
// app.use('/v1/route', routeRoute);
// app.use('/v1/timetable', timetableRoute);


/**
 * Exports express
 * @public
 */
module.exports = app;
