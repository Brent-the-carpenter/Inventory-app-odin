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

// remove everything below .

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

const LocationSchema = new Schema({
  state: { type: String, required: true, maxLength: 20 },
  address: { type: String, required: true, maxLength: 50 },

  phoneNumber: { type: String, required: true, maxLength: 15 },
  open: [
    {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      maxlength: 9,
    },
  ],
  zip: { type: String, required: true, maxLength: 10 },
});

LocationSchema.virtual("url").get(function () {
  return `/store/location/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);
