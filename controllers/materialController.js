const category = require("../models/category");
const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");
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

  res.render("material_form", {
    page_title: "Create Material",
    categories: categories,
  });
});

exports.material_post_create = [
  body("name", "Name of material is required.")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters."),
  body("category", "Category must be seleceted.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters."),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const material = new Material({
      name: req.body.name,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
    });
    const checkName = await Material.find({ name: material.name }).exec();
    if (checkName.length) {
      errors.errors.push({
        value: material.name,
        msg: "Material with this name already exsist.",
        param: "name",
        location: "body",
      });
    }
    if (!errors.isEmpty()) {
      const categories = await Category.find({}).sort({ name: 1 }).exec();
      return res.render("material_form", {
        page_title: "Create Material",
        categories: categories,
        material: material,
        errors: errors.array(),
      });
    } else {
      await material.save();
      await Category.findOneAndUpdate(
        { _id: material.category },
        { $push: { materials: material._id } }
      );

      res.redirect(material.url);
    }
  }),
];

exports.material_get_delete = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.id);
  if (!material) {
    const error = new Error("Material not found.");
    console.error("Material GET_delete: material not found.", error.stack);
    error.status = 404;

    return next(error);
  }
  res.render("material_delete", {
    id: req.params.id,
    material: material,
  });
});

exports.material_post_delete = asyncHandler(async (req, res, next) => {
  const category = await Category.findOneAndUpdate(
    { materials: req.params.id },
    { $pull: { materials: req.params.id } },
    { new: true }
  );
  if (!category) {
    const error = new Error("Category not found.");
    console.error("Category not found in material delete post.", error.stack);
    error.status = 404;
    return next(error);
  }
  await Material.findByIdAndDelete(req.params.id);
  res.redirect("/store/material");
});

exports.material_get_update = asyncHandler(async (req, res, next) => {
  const [material, categories] = await Promise.all([
    Material.findById(req.params.id).exec(),
    Category.find({}).sort({ name: 1 }).exec(),
  ]);
  if (!material) {
    const error = new Error("Material not found.");
    error.status = 404;
    console.error("Material_Update: Material not found.", error.stack);
    return next(error);
  }

  res.render("material_form", {
    page_title: "Update Material",
    material: material,
    categories: categories,
  });
});

exports.material_post_update = [
  body("name", "Name of material is required.")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters."),
  body("category", "Category must be seleceted.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters."),

  asyncHandler(async (req, res, next) => {
    const [material, categories] = await Promise.all([
      Material.findById(req.params.id).exec(),
      Category.find({}).sort({ name: 1 }).exec(),
    ]);

    const errors = validationResult(req);
    const updatedMaterial = new Material({
      name: req.body.name,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
      _id: material._id,
    });
    if (!errors.isEmpty()) {
      res.render("material_form", {
        page_title: "Update Material",
        material: updatedMaterial,
        categories: categories,
        errors: errors.array(),
      });
      return;
    } else {
      const updateMaterial = await Material.findByIdAndUpdate(
        material._id,
        updatedMaterial,
        { new: true }
      );
      if (!updateMaterial) {
        const error = new Error("Material not found.");
        error.status = 404;
        console.error("Material_Update: Material not found.", error.stack);
        return next(error);
      }
      res.redirect(updatedMaterial.url);
    }
  }),
];
