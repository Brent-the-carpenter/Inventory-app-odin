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
});

LocationSchema.virtual("url").get(function () {
  return `/catalog/location/${this._id}`;
});

module.exports = mongoose.model("Location", LocationSchema);
