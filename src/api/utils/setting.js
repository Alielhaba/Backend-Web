const Setting = require("../models/setting.model");

const settingS3 = async() => {
    const getsetting = await Setting.findOne({},"s3").lean();
    return {
        access_key:getsetting.s3.access_key,
        secret_key:getsetting.s3.secret_key,
        region:getsetting.s3.region,
        bucket:getsetting.s3.bucket,
    };
}


module.exports = { settingS3 };