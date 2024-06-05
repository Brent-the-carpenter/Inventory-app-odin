const Location = require("../models/location");
const debug = require("debug")("app:location");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

exports.location_list = asyncHandler(async (req, res, next) => {
  const count_by_state = await Location.aggregate([
    {
      $group: {
        _id: "$state",
        count: { $sum: 1 },
        locations: { $push: "$$ROOT" },
      },
    },
  ]);

  res.render("location_list", {
    page_title: "List of all Locations",
    count_by_state: count_by_state,
  });
});
exports.location_detail = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  if (!location) {
    const err = new Error("Location not found.");
    err.status = 404;
    return next(err);
  }

  const formatted_schedule = [];
  daysOfWeek.forEach((day) => {
    const openDay = location.open.find((openDay) => openDay === day);
    if (openDay) {
      formatted_schedule.push(`${day} Open`);
    } else {
      formatted_schedule.push(`${day} Closed`);
    }
  });
  res.render("location_detail", {
    page_title: "Location Details",
    location: location,
    formatted_schedule: formatted_schedule,
  });
});
exports.location_get_create = asyncHandler(async (req, res, next) => {});
exports.location_post_create = asyncHandler(async (req, res, next) => {});
exports.location_get_delete = asyncHandler(async (req, res, next) => {});
exports.location_post_delete = asyncHandler(async (req, res, next) => {});
exports.location_get_update = asyncHandler(async (req, res, next) => {});
exports.location_post_update = asyncHandler(async (req, res, next) => {});
