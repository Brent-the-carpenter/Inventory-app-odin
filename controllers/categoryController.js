const Category = require("../models/category");
const Store = require("../models/store");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:category");

const {
  getAllRows,
  getRow,
  getMaterialInCategory,
  checkForCategory,
  addCategory,
  checkForMaterial,
  checkForLinkedMaterials,
  deleteCategory,
  updateCategory,
} = require("../db/quires");

//✅
exports.category_list = asyncHandler(async (req, res, next) => {
  // const category_list = await Category.find({}).exec();
  try {
    const categories = await getAllRows("categories");
    if (categories.length > 0) {
      console.log(categories);
      return res.render("category_list", {
        page_title: "categories",
        category_list: categories,
      });
    } else {
      console.log(categories);
      return res.render("category_list", {
        page_title: "Categories",
        category_list: null,
        message: "No categories found.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.render("category_list", {
      page_title: "Categories",
      error: error.message,
    });
  }
});

//✅
exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await getRow("categories", req.params.id);
  const materials = await getMaterialInCategory(req.params.id);
  const store = await getRow("stores", category.store_id);
  if (!category) {
    const err = new Error("Category not found.");
    err.status = 404;
    return next(err);
  }
  return res.render("category_detail", {
    page_title: "Category Detail",
    category: category,
    materials: materials.length > 0 ? materials : null,
    store,
  });
});

//✅
exports.category_create_get = asyncHandler(async (req, res, next) => {
  debug("We are in the route controller");
  const stores = await getAllRows("stores");
  debug(stores);
  res.render("category_form", {
    page_title: "Create Category",
    stores,
  });
});

//✅
exports.category_create_post = [
  body("cat_name", "Name is a required field.")
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
  body("store_id").trim().escape().toInt(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { cat_name, summary, store_id } = req.body;
    const category = {
      cat_name,
      summary,
      store_id,
    };
    const checkForCategoryName = await checkForCategory(category.cat_name);
    if (checkForCategoryName?.cat_name === category.cat_name) {
      errors.errors.push({
        value: category.cat_name,
        msg: "Category with this name already exists",
        param: "name",
        location: "body",
      });
    }
    if (!errors.isEmpty()) {
      const stores = await getAllRows("stores");

      return res.render("category_form", {
        page_title: "Create Category",
        stores,
        category: category,
        errors: errors.array(),
      });
    } else {
      const newCategory = await addCategory(category);
      if (!newCategory) {
        console.error(`Error adding new category: ${category}.`);
        return next(createError(500, `Internal server error.`));
      }
      return res.redirect(`/store/category/${newCategory.id}`);
    }
  }),
];
//✅
exports.category_get_delete = asyncHandler(async (req, res, next) => {
  const category = await getRow("categories", req.params.id);

  res.render("category_delete", {
    id: req.params.id,
    category: category,
  });
});
//✅
exports.category_post_delete = asyncHandler(async (req, res, next) => {
  const materialsLinkedToCat = await checkForLinkedMaterials(req.params.id);
  const category = await getRow("categories", req.params.id);
  console.log(materialsLinkedToCat);
  if (materialsLinkedToCat.length > 0) {
    return res.render("category_delete", {
      id: req.params.id,
      category: category,
      materialsLinkedToCat,
    });
  } else {
    const result = await deleteCategory(category.id);
    if (!result) {
      return next(
        createError(500, `Failed to delete category: ${category.name}`)
      );
    }
    return res.redirect("/store/category");
  }
});

//✅
exports.category_get_update = asyncHandler(async (req, res, next) => {
  const category = await getRow("categories", req.params.id);
  const stores = await getAllRows("stores");

  if (!category) {
    const error = new Error("Category not found");
    err.status = 404;
    console.error("Category_update: category not found. ", error.stack);
    return next(error);
  }
  if (!stores) {
    const error = new Error("Store not found");
    err.status = 404;
    console.error("Category_update: store not found. ", error.stack);
    return next(error);
  }

  return res.render("category_form", {
    page_title: "Update Category",
    category: category,
    stores,
  });
});

//✅
exports.category_post_update = [
  body("cat_name", "Name is a required field.")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long.")
    .isAlpha()
    .withMessage("Name must only contain Alpha Characters."),
  body("summary", "Summary of category is Required.")
    .trim()
    .escape()
    .isLength({ min: 10, max: 300 })
    .withMessage("Summary must be between 10 and 200 characters."),
  body("store_id").trim().escape().toInt(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { cat_name, summary, store_id } = req.body;
    const category = {
      cat_name,
      summary,
      store_id,
    };
    if (!errors.isEmpty()) {
      const stores = await getAllRows("stores");

      res.render("category_create", {
        category: category,
        page_title: "Update Category",
        stores,
      });
      return;
    } else {
      const updatedCategory = await updateCategory(category, req.params.id);
      if (!updateCategory) {
        return next(createError(500, `Failed to update category:${cat_name}`));
      }
      return res.redirect(`/store/category/${updatedCategory.id}`);
    }
  }),
];
