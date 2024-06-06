const category = require("../models/category");
const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:material");

const title = "The Better Choice for Building Material";
exports.material_list = asyncHandler(async (req, res, next) => {
  const material_list = await Material.find({}).sort({ name: 1 }).exec();
  debug(material_list);
  res.render("material_list", {
    page_title: "List of Materials",
    material_list: material_list,
  });
});

exports.material_detail = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.id)
    .populate("category")
    .exec();
  if (!material) {
    const err = new Error("Material not found.");
    err.status = 404;
    return next(err);
  }
  res.render("material_detail", {
    page_title: "Material Details",
    material: material,
  });
});

exports.material_get_create = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({})
    .sort({ name: 1 })
    .populate("materials")
    .exec();
  debug(categories);
  res.render("material_form", {
    page_title: "Create Material",
    categories: categories,
  });
});

exports.material_post_create = asyncHandler(async (req, res, next) => {});

exports.material_get_delete = asyncHandler(async (req, res, next) => {});

exports.material_post_delete = asyncHandler(async (req, res, next) => {});

exports.material_get_update = asyncHandler(async (req, res, next) => {});

exports.material_post_update = asyncHandler(async (req, res, next) => {});
