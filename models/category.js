const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 50 },
  summary: { type: String, required: true, maxLength: 200 },
  materials: [{ type: Schema.Types.ObjectId, ref: "Material" }],
  store: { type: Schema.Types.ObjectId, ref: "Store" },
});

CategorySchema.virtual("url").get(function () {
  return `/store/category/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);
