const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StoreSchema = new Schema({
  name: { type: String, required: true, maxLength: 50 },
  date_opened: { type: Date, required: true },
  locations: [{ type: Schema.Types.ObjectId, ref: "Location" }],
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

StoreSchema.virtual("url").get(function () {
  return `/store/${this._id}`;
});

module.exports = mongoose.model("Store", StoreSchema);
