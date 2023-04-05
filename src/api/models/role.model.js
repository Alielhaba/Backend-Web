const mongoose = require("mongoose");
const { omitBy, isNil } = require("lodash");
const mongoosePaginate = require("mongoose-paginate-v2");
const { Schema } = mongoose;
const { ObjectId } = Schema;
const moment = require("moment-timezone");

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
  },
  { timestamps: true }
);

RoleSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "name", "slug", "createdAt"];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

RoleSchema.statics = {
  async get(slug) {
    const role = await this.findOne({ slug }, "slug").lean();
    return role.slug;
  },
  transformOptions(data){
    const selectableItems = [];
    const i = 1;
    data.forEach((item) => {
      selectableItems.push({
        value:item.slug,
        text:item.name
      });
    });
    return selectableItems;
  },
  transformSingleData(item) {
    return {
      id: item._id,
      name: item.name,
      slug: item.slug,
    };
  },
  transformData: (data) => {
    const selectableItems = [];
    let i = 1;
    data.forEach((item) => {
      selectableItems.push({
        id: i++,
        ids: item.id,
        name: item.name,
        slug: item.slug,
        createdAt: moment
          .utc(item.createdAt)
          .tz("Asia/Kolkata")
          .format("DD MMM YYYY"),
      });
    });
    return selectableItems;
  },
};

RoleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Role", RoleSchema);
