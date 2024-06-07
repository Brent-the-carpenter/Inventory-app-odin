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
  const [materials, store] = await Promise.all([
    Material.find({}).sort({ name: 1 }).exec(),
    Store.findOne({}).exec(),
  ]);
  debug(store._id);
  res.render("category_form", {
    page_title: "Create Category",
    materials: materials,
    store: store,
  });
});

exports.category_create_post = [
  body("name", "Name is a required field.")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long.")
    .isAlpha()
    .withMessage("Name must only contain Alpha Charecters."),
  body("summary", "Summary of category is Required.")
    .trim()
    .escape()
    .isLength({ min: 10, max: 300 })
    .withMessage("Summary must be between 10 and 200 characters."),
  body("store").trim().escape(),
  body("material.*").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      summary: req.body.summary,
      materials: req.body.material,
      store: req.body.store,
    });
    const checkForCategoryName = await Category.find({
      name: category.name,
    }).exec();
    if (checkForCategoryName.length) {
      errors.errors.push({
        value: category.name,
        msg: "Category with this name already exists",
        param: "name",
        location: "body",
      });
    }
    if (!errors.isEmpty()) {
      const materials = await Material.find({}).sort({ name: 1 }).exec();

      for (const material of materials) {
        if (
          category.materials &&
          category.materials.includes(material._id.toString())
        ) {
          material.checked = "true";
        }
      }
      debug("we get to here in the function", errors);
      return res.render("category_form", {
        page_title: "Create Category",
        materials: materials,
        category: category,
        errors: errors.array(),
      });
    } else {
      await category.save();
      res.redirect(category.url);
    }
  }),
];

exports.category_get_delete = asyncHandler(async (req, res, next) => {});

exports.category_post_delete = asyncHandler(async (req, res, next) => {});

exports.category_get_update = asyncHandler(async (req, res, next) => {});

exports.category_post_update = asyncHandler(async (req, res, next) => {});
