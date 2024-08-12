const Location = require("../models/location");
const Store = require("../models/store");
const debug = require("debug")("app:location");
const asyncHandler = require("express-async-handler");
const createError = require("http-errors");
const { body, validationResult, param } = require("express-validator");
const {
  getRow,
  getLocationsByState,
  checkForLocation,
  getAllRows,
  addLocation,
  deleteRow,

  updateLocation,
} = require("../db/quires");

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

//✅
exports.location_list = asyncHandler(async (req, res, next) => {
  const locations = await getLocationsByState();

  res.render("location_list", {
    page_title: "List of all Locations",
    count_by_state: locations,
  });
});

//✅
exports.location_detail = asyncHandler(async (req, res, next) => {
  // const location = await Location.findById(req.params.id);

  const location = await getRow("locations", req.params.id);
  console.log(location);
  if (!location) {
    const err = new Error("Location not found.");
    err.status = 404;
    return next(err);
  }

  const daysOpen = location.open.slice(1, -1).split(",");

  const formatted_schedule = [];
  daysOfWeek.forEach((day) => {
    const openDay = daysOpen.find((openDay) => openDay === day);
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

//✅
exports.location_get_create = asyncHandler(async (req, res, next) => {
  try {
    const stores = await getAllRows("stores");
    return res.render("location_form", {
      page_title: "Create Location",
      days: daysOfWeek,
      stores,
    });
  } catch (error) {
    next(createError(500, "Error Getting location form."));
  }
});

//✅
exports.location_post_create = [
  (req, res, next) => {
    if (!Array.isArray(req.body.open)) {
      req.body.open =
        typeof req.body.open === "undefined" ? [] : [req.body.open];
    }
    next();
  },

  body("state", "State is required.")
    .trim()
    .escape()
    .isLength({ min: 2, max: 2 })
    .withMessage("please abbreviate state."),
  body("address", "Address is required.").trim().isLength({ min: 6 }).escape(),
  body("phoneNumber")
    .trim()
    .escape()
    .isLength({ min: 10, max: 16 })
    .withMessage("Phone number must be between 10 and 16 characters."),
  body("zip", "Zip code is a required field.").trim().escape(),
  body("store_id")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please select a store."),
  body("open.*").escape().isLength({ min: 1 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const { state, address, phoneNumber, open, zip, store_id } = req.body;
    const location = {
      state,
      address,
      phoneNumber,
      open,
      zip,
      store_id,
      errors: errors.array(),
    };
    const check = await checkForLocation(address);
    if (!check === null) {
      errors.errors.push({
        value: location.address,
        msg: "A location with this address already exist.",
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
      const newLocation = await addLocation(location);
      res.redirect(`/store/location/${newLocation.id}`);
    }
  }),
];

//✅
exports.location_get_delete = asyncHandler(async (req, res, next) => {
  try {
    const location = await getRow("locations", req.params.id);
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

//✅
exports.location_post_delete = asyncHandler(async (req, res, next) => {
  const result = await deleteRow("locations", req.params.id);
  if (result.id) {
    return res.redirect("/store/location");
  } else {
    const error = new Error(`Failed to delete location with id: ${id}`);
    error.status = 500;
    next(error);
  }
});

//✅
exports.location_get_update = asyncHandler(async (req, res, next) => {
  const location = await getRow("locations", req.params.id);
  const stores = await getAllRows("stores");
  const daysOfWeekWithStatus = daysOfWeek.map((day) => ({
    name: day,
    checked: location.open.includes(day),
  }));
  res.render("location_form", {
    page_title: "Update Location",
    location: location,
    days: daysOfWeek,
    stores,
  });
});

//✅
exports.location_post_update = [
  (req, res, next) => {
    if (!Array.isArray(req.body.open)) {
      req.body.open = req.body.open === undefined ? [] : [req.body.open];
    }
    next();
  },
  body("state", "State is required.")
    .trim()
    .escape()
    .isLength({ min: 2, max: 2 })
    .withMessage("please abbreviate state."),
  body("address", "Address is required.").trim().isLength({ min: 6 }).escape(),
  body("phoneNumber")
    .trim()
    .escape()
    .isLength({ min: 10, max: 16 })
    .withMessage("Phone number must be between 10 and 16 characters."),
  body("zip", "Zip code is a required field.").trim().escape(),
  body("store_id")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please select a store."),
  body("open.*").escape().isLength({ min: 1 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const { state, address, phoneNumber, zip, open, store_id } = req.body;
    const location = { state, address, phoneNumber, zip, open, store_id };
    if (!errors.isEmpty()) {
      const daysOfWeekWithStatus = daysOfWeek.map((day) => ({
        name: day,
        checked: location.open.includes(day),
      }));
      res.render("location_form", {
        page_title: "Update Location",
        location: location,
        errors: errors.array(),
        days: daysOfWeekWithStatus,
      });
      return;
    } else {
      const updatedLocation = await updateLocation(
        "locations",
        req.params.id,
        location
      );
      res.redirect(`/store/location/${updatedLocation.id}`);
    }
  }),
];
