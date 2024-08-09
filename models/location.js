const mongoose = require("mongoose"); // import mongoose module

const Schema = mongoose.Schema; // to easily access mongoose Schema class property

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

module.exports = mongoose.model("Location", LocationSchema);

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
