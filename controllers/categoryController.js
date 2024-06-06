const Category = require("../models/category");
const Store = require("../models/store");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:category");

exports.category_list = asyncHandler(async (req, res, next) => {
  const category_list = await Category.find({}).exec();

  res.render("category_list", {
    page_title: "Categories",
    category_list: category_list,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate("materials")
    .exec();
  if (!category) {
    const err = new Error("Category not found.");
    err.status = 404;
    return next(err);
  }
  res.render("category_detail", {
    page_title: "Category Detail",
    category: category,
    materials: category.materials,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  debug("We are in the route controller");
  const materials = await Material.find({}).sort({ name: 1 }).exec();
  res.render("category_form", {
    page_title: "Create Category",
    materials: materials,
  });
});

exports.category_create_post = asyncHandler(async (req, res, next) => {});

exports.category_get_delete = asyncHandler(async (req, res, next) => {});

exports.category_post_delete = asyncHandler(async (req, res, next) => {});

exports.category_get_update = asyncHandler(async (req, res, next) => {});

exports.category_post_update = asyncHandler(async (req, res, next) => {});
