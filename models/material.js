const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  stock: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  image: {
    url: { type: String },
    public_id: { type: String },
  },
});

MaterialSchema.virtual("url").get(function () {
  return `/store/material/${this._id}`;
});

module.exports = mongoose.model("Material", MaterialSchema);
