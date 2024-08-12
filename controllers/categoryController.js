const Category = require("../models/category");
const Store = require("../models/store");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:category");

const { categoriesGetAll } = require("../db/quires");

exports.category_list = asyncHandler(async (req, res, next) => {
  // const category_list = await Category.find({}).exec();
  try {
    const categories = await GetAllRows("categories");
    if (categories.length > 0) {
      res.render("category_list", {
        page_title: "Categories",
        category_list: categories,
      });
    } else {
      res.render("category_list", {
        page_title: "Categories",
        category_list: null,
        message: "No categories found.",
      });
    }
  } catch (error) {
    res.render("category_list", {
      page_title: "Categories",
      error: error.message,
    });
  }
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate({ path: "materials", options: { sort: { name: 1 } } })
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
          category.materials.some(
            (catMaterial) =>
              catMaterial._id.toString() === material._id.toString()
          )
        ) {
          material.checked = true;
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

exports.category_get_delete = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate("materials")
    .exec();
  res.render("category_delete", {
    id: req.params.id,
    category: category,
  });
});

exports.category_post_delete = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.id)
    .populate("materials")
    .exec();
  if (category.materials.length) {
    return res.render("category_delete", {
      id: req.params.id,
      category: category,
    });
  } else {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect("/store/category");
  }
});

exports.category_get_update = asyncHandler(async (req, res, next) => {
  const [category, store, materials] = await Promise.all([
    Category.findById(req.params.id).populate("materials").exec(),
    Store.findOne({ categories: { $in: [req.params.id] } }).exec(),
    Material.find({}, "name").sort({ name: 1 }).exec(),
  ]);
  if (!category) {
    const error = new Error("Category not found");
    err.status = 404;
    console.error("Category_update: category not found. ", error.stack);
    return next(error);
  }
  if (!store) {
    const error = new Error("Store not found");
    err.status = 404;
    console.error("Category_update: store not found. ", error.stack);
    return next(error);
  }
  for (const material of materials) {
    if (
      category.materials.some(
        (catMaterial) => catMaterial._id.toString() === material._id.toString()
      )
    )
      material.checked = true;
  }
  res.render("category_form", {
    page_title: "Update Category",
    category: category,
    store: store,
    materials: materials,
  });
});

exports.category_post_update = [
  (req, res, next) => {
    if (!Array.isArray(req.body.material)) {
      req.body.material =
        typeof req.body.material === undefined ? [] : [req.body.material];
    }
    next();
  },
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
      summary: req.body.name,
      materials: req.body.material,
      store: req.body.store,
      _id: req.body.category_id,
    });
    if (!errors.isEmpty()) {
      const materials = Material.find({}, "name").sort({ name: 1 }).exec();
      for (const material in materials) {
        if (category && category.materials.includes(material._id.toString())) {
          material.checked = true;
        }
      }
      res.render("category_create", {
        category: category,
        page_title: "Update Category",
        materials: materials,
      });
      return;
    } else {
      const UpdatedCategory = await Category.findByIdAndUpdate(
        category._id,
        category,
        {}
      ).exec();
      res.redirect(UpdatedCategory.url);
    }
  }),
];
