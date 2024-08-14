const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:material");
const uploadImage = require("../cloudinary").uploadImage;
const { getAllRows, getRow, getCategoryOfMaterial } = require("../db/quires");

const customEscape = (str) => {
  return str
    .replace(/&/g, "&amp")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&qout;")
    .replace(/'/g, "&#39;");
};

//✅
exports.material_list = asyncHandler(async (req, res, next) => {
  try {
    const material_list = await getAllRows("materials");
    debug(material_list);
    return res.render("material_list", {
      page_title: "List of Materials",
      material_list: material_list,
    });
  } catch (error) {
    console.error(
      `Failed to retrieve all materials from db. Error: ${error.message}`
    );
    return next(error);
  }
});

//✅
exports.material_detail = asyncHandler(async (req, res, next) => {
  // const material = await Material.findById(req.params.id)
  //   .populate("category")
  //   .exec();
  try {
    const material = await getRow("materials", req.params.id);
    const category = await getCategoryOfMaterial(material.category_id);
    if (!material) {
      const err = new Error("Material not found.");
      err.status = 404;
      return next(err);
    }
    return res.render("material_detail", {
      page_title: "Material Details",
      material: material,
      category,
    });
  } catch (error) {
    console.error(`Error in material details, Error:${error.message}`);
    next(error);
  }
});

exports.material_get_create = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}).sort({ name: 1 }).exec();

  res.render("material_form", {
    page_title: "Create Material",
    categories: categories,
  });
});

exports.material_post_create = [
  body("name", "Name of material is required.")
    .trim()
    .customSanitizer((value) => customEscape(value))
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters."),
  body("category", "Category must be selected.").trim().escape(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters."),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { file } = req;
    let uploadResult;

    if (file) {
      try {
        // Upload to Cloudinary
        uploadResult = await uploadImage(file.buffer);
      } catch (error) {
        return next(error);
      }
    }

    const material = new Material({
      name: req.body.name,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
      image: uploadResult
        ? {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          }
        : undefined,
    });

    const checkName = await Material.find({ name: material.name }).exec();
    if (checkName.length) {
      errors.errors.push({
        value: material.name,
        msg: "Material with this name already exists.",
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
    .customSanitizer((value) => customEscape(value))
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters."),
  body("category", "Category must be selected.").trim().escape(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters."),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { file } = req;
    let uploadResult;

    if (file) {
      try {
        // Upload to Cloudinary
        uploadResult = await uploadImage(file.buffer);
      } catch (error) {
        return next(error);
      }
    }

    const updatedMaterial = {
      name: req.body.name,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    };

    if (uploadResult) {
      updatedMaterial.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    if (!errors.isEmpty()) {
      const categories = await Category.find({}).sort({ name: 1 }).exec();
      res.render("material_form", {
        page_title: "Update Material",
        material: updatedMaterial,
        categories: categories,
        errors: errors.array(),
      });
      return;
    } else {
      const updateMaterial = await Material.findByIdAndUpdate(
        req.params.id,
        updatedMaterial,
        { new: true }
      );
      if (!updateMaterial) {
        const error = new Error("Material not found.");
        error.status = 404;
        console.error("Material_Update: Material not found.", error.stack);
        return next(error);
      }
      res.redirect(updateMaterial.url);
    }
  }),
];
