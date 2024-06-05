const Category = require("../models/category");
const Store = require("../models/store");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:category");

const title = "The Better Choice for Building Material";
exports.category_list = asyncHandler(async (req, res, next) => {
  const category_list = await Category.find({}).exec();

  res.render("category_list", {
    title: title,
    page_title: "Categories",
    category_list: category_list,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {});

exports.category_create_get = asyncHandler(async (req, res, next) => {});

exports.category_create_post = asyncHandler(async (req, res, next) => {});

exports.category_get_delete = asyncHandler(async (req, res, next) => {});

exports.category_post_delete = asyncHandler(async (req, res, next) => {});

exports.category_get_update = asyncHandler(async (req, res, next) => {});

exports.category_post_update = asyncHandler(async (req, res, next) => {});
