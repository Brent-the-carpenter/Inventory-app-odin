const Location = require("../models/location");
const Store = require("../models/store");
const debug = require("debug")("app:location");
const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

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
exports.location_get_create = asyncHandler(async (req, res, next) => {
  res.render("location_form", {
    page_title: "Create Location",
    days: daysOfWeek,
  });
});
exports.location_post_create = [
  (req, res, next) => {
    if (!Array.isArray(req.body.open)) {
      typeof req.body.open === "undefined" ? [] : [req.body.open];
    }
    next();
  },

  body("state", "State is required.")
    .trim()
    .escape()
    .isLength({ min: 2, max: 2 })
    .withMessage("please abbrivate state."),
  body("address", "Address is required.").trim().isLength({ min: 6 }).escape(),
  body("phoneNumber")
    .trim()
    .escape()
    .isLength({ min: 10, max: 16 })
    .withMessage("Phone number must be between 10 and 16 characters."),
  body("open.*").escape().isLength({ min: 1 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const location = new Location({
      state: req.body.state,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      open: req.body.open,
      errors: errors.array(),
    });
    const check = await Location.find({ address: location.address }).exec();
    if (check.length) {
      errors.errors.push({
        value: location.address,
        msg: "A location with this address already exisit.",
        param: "address",
        location: "body",
      });
    }
    if (!errors.isEmpty()) {
      return res.render("location_form", {
        page_title: "Create Location",
        location: location,
        days: daysOfWeek,
        errors: errors,
      });
    } else {
      await location.save();
      res.redirect(location.url);
    }
  }),
];
exports.location_get_delete = asyncHandler(async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      const err = new Error("Location not found.");
      err.status = 404;
      return next(err);
    }
    res.render("location_delete", {
      id: location._id,
      location: location,
    });
  } catch (error) {
    next(error);
  }
});
exports.location_post_delete = asyncHandler(async (req, res, next) => {
  const store = await Store.findOneAndUpdate(
    { locations: req.params.id },
    { $pull: { locations: req.params.id } },
    { new: true }
  ).exec();
  if (!store) {
    const err = new Error("Store not found");
    err.status = 404;
    return next(err);
  }
  await Location.findByIdAndDelete(req.params.id);
  res.redirect("/store/location");
});
exports.location_get_update = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id).exec();

  const daysOfWeekWithStatus = daysOfWeek.map((day) => ({
    name: day,
    checked: location.open.includes(day),
  }));
  res.render("location_form", {
    page_title: "Update Location",
    location: location,
    days: daysOfWeek,
  });
});
exports.location_post_update = [
  (req, res, next) => {
    if (!Array.isArray(req.body.open)) {
      req.body.open === undefined ? [] : [req.body.open];
    }
    next();
  },
  body("state", "State is required.")
    .trim()
    .escape()
    .isLength({ min: 2, max: 2 })
    .withMessage("please abbrivate state."),
  body("address", "Address is required.").trim().isLength({ min: 6 }).escape(),
  body("phoneNumber")
    .trim()
    .escape()
    .isLength({ min: 10, max: 16 })
    .withMessage("Phone number must be between 10 and 16 characters."),
  body("open.*").escape().isLength({ min: 1 }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const location = new Location({
      state: req.body.state,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zip: req.body.zip,
      open: req.body.open,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const daysOfWeekWithStatus = daysOfWeek.map((day) => ({
        name: day,
        checked: updatedday.open.includes(day),
      }));
      res.render("location_form", {
        page_title: "Update Location",
        location: location,
        errors: errors.array(),
        days: daysOfWeekWithStatus,
      });
      return;
    } else {
      const UpdateLocation = await Location.findByIdAndUpdate(
        location._id,
        location,
        {}
      );
      res.redirect(UpdateLocation.url);
    }
  }),
];
