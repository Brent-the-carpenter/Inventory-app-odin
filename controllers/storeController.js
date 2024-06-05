const Location = require("../models/location");
const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const debug = require("debug")("app:store");
const { DateTime } = require("luxon");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [locations, categories, materials] = await Promise.all([
    Location.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
    Material.countDocuments({}).exec(),
  ]);
  const dateToday = new Date().getFullYear();

  res.render("index", {
    title: "The Better Choice for Building Supplies",
    location_count: locations,
    category_count: categories,
    material_count: materials,
    date: dateToday,
  });
});
