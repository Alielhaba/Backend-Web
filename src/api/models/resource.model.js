const mongoose = require("mongoose");
const { omitBy, isNil } = require("lodash");
const mongoosePaginate = require("mongoose-paginate-v2");
const { Schema } = mongoose;
const { ObjectId } = Schema;
const moment = require("moment-timezone");
const slug = require('slug')

const ResourceSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    resources_roles: [
      {
        role_id: { type: Schema.Types.ObjectId, ref: "Role" },
        role_name: { type: String },
        create: { type: Boolean },
        delete: { type: Boolean },
        update: { type: Boolean },
        read: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

ResourceSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "name", "slug"];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

ResourceSchema.statics = {
  transformLoad(rows, role) {
    var i = 1;
    const selectableItems = [];
    rows.forEach((item) => {
      selectableItems.push({
        id: i++,
        ids: item._id,
        name: item.name,
        slug: item.slug,
        // read: '',
        // create: '',
        // update: '',
        // delete: '',
        permissions: this.filterRoles(item.resources_roles, role)
      });
    });
    return selectableItems;
  },
  filterRoles(item, role) {

    console.log("item",item);
    
      const getData = item.filter(v => slug(v.role_name) === role);
      if (getData.length > 0) {
        return [
          { text: 'Read', value: getData[0].read },
          { text: 'Create', value: getData[0].create },
          { text: 'Update', value: getData[0].update },
          { text: 'Delete', value: getData[0].delete },
        ];
      }else{
      return [];
    }
  },
  async get(slug) {
    const role = await this.findOne({ slug }, "slug").lean();
    return role.slug;
  },
  transformSingleData(item) {
    return {
      id: item._id,
      name: item.name,
      slug: item.slug,
      resources_roles: item.resources_roles,
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
        resources_roles: item.resources_roles,
        createdAt: moment
          .utc(item.createdAt)
          .tz("Asia/Kolkata")
          .format("DD MMM YYYY"),
      });
    });
    return selectableItems;
  },
  transformResourcesRoles: (data) => {
    const selectableItems = [];
    data.forEach((item) => { });
    return selectableItems;
  },
};

ResourceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Resource", ResourceSchema);
