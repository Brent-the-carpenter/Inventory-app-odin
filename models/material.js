const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  stock: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
});

MaterialSchema.virtual("url").get(function () {
  return `/catalog/material/${this._id}`;
});

module.exports = mongoose.model("Material", MaterialSchema);
