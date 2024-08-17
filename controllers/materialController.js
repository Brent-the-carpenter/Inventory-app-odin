const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:material");
const uploadImage = require("../cloudinary").uploadImage;
const createError = require("http-errors");
const {
  getAllRows,
  getRow,
  getCategoryOfMaterial,
  checkForMaterial,
  addMaterial,
  deleteMaterial,
  updateMaterial,
} = require("../db/quires");

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
    return next(createError(500, "Internal server error."));
  }
});

//✅
exports.material_detail = asyncHandler(async (req, res, next) => {
  try {
    const material = await getRow("materials", req.params.id);
    debug("material detail ", material);
    const category = await getCategoryOfMaterial(material.category_id);
    if (!material) {
      return next(createError(404, "Material not found."));
    }
    return res.render("material_detail", {
      page_title: "Material Details",
      material: material,
      category,
    });
  } catch (error) {
    console.error(`Error in material details, Error:${error.message}`);
    return next(createError(500, "Internal server error."));
  }
});

//✅
exports.material_get_create = asyncHandler(async (req, res, next) => {
  try {
    const categories = await getAllRows("categories");

    res.render("material_form", {
      page_title: "Create Material",
      categories: categories,
    });
  } catch (error) {
    return next(createError(500, "Internal server error."));
  }
});

//✅
exports.material_post_create = [
  body("mat_name", "Name of material is required.")
    .trim()
    .customSanitizer((value) => customEscape(value))
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters.")
    .toInt(),
  body("category_id", "Category must be selected.").trim().escape().toInt(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters.")
    .toFloat(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { file } = req;
    let uploadResult;

    if (file) {
      try {
        // Upload to Cloudinary
        uploadResult = await uploadImage(file.buffer);
      } catch (error) {
        return next(createError(500, "Internal server error."));
      }
    }

    const { mat_name, stock, category_id, price } = req.body;
    const material = {
      mat_name,
      stock,
      category_id,
      price,
      img_url: uploadResult ? uploadResult.secure_url : null,
      img_id: uploadResult ? uploadResult.public_id : null,
    };

    const checkName = await checkForMaterial(mat_name);

    if (checkName.mat_name === mat_name) {
      errors.errors.push({
        value: material.mat_name,
        msg: "Material with this name already exists.",
        param: "name",
        location: "body",
      });
    }

    if (!errors.isEmpty()) {
      const categories = await getAllRows("categories");
      return res.render("material_form", {
        page_title: "Create Material",
        categories: categories,
        material: material,
        errors: errors.array(),
      });
    } else {
      const newMaterial = await addMaterial(material);
      if (!newMaterial) {
        return next(createError(500, "Error creating new material."));
      }
      debug(newMaterial);
      return res.redirect(`/store/material/${newMaterial.id}`);
    }
  }),
];
//✅
exports.material_get_delete = asyncHandler(async (req, res, next) => {
  const material = await getRow("materials", req.params.id);
  if (!material) {
    const error = new Error("Material not found.");
    console.error("Material GET_delete: material not found.", error.stack);
    error.status = 404;

    return next(createError(500, "Internal server error."));
  }
  res.render("material_delete", {
    id: req.params.id,
    material: material,
  });
});
//✅
exports.material_post_delete = asyncHandler(async (req, res, next) => {
  const result = await deleteMaterial(req.params.id);
  if (!result) {
    return next(createError(500, "Failed to delete material from db."));
  }
  res.redirect("/store/material");
});
//✅
exports.material_get_update = asyncHandler(async (req, res, next) => {
  const [material, categories] = await Promise.all([
    getRow("materials", req.params.id),
    getAllRows("categories"),
  ]);
  if (!material) {
    const error = new Error("Material not found.");
    error.status = 404;
    console.error("Material_Update: Material not found.", error.stack);
    return next(createError(500, "Internal server error."));
  }

  res.render("material_form", {
    page_title: "Update Material",
    material: material,
    categories: categories,
  });
});
//✅
exports.material_post_update = [
  body("mat_name", "Name of material is required.")
    .trim()
    .customSanitizer((value) => customEscape(value))
    .isLength({ min: 3 })
    .withMessage("Name must be at least three characters long"),
  body("stock", " Stock is required.")
    .escape()
    .isNumeric()
    .withMessage("Stock must only contain numeric characters.")
    .toInt(),
  body("category", "Category must be selected.").trim().escape().toInt(),
  body("price", "Price is required.")
    .escape()
    .isNumeric()
    .withMessage("Price must only contain numeric characters.")
    .toFloat(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { file } = req;
    let uploadResult;

    if (file) {
      try {
        // Upload to Cloudinary
        uploadResult = await uploadImage(file.buffer);
      } catch (error) {
        return next(createError(500, "Internal server error."));
      }
    }

    const { mat_name, stock, category_id, price } = req.body;
    const material = {
      mat_name,
      stock,
      category_id,
      price,
      img_url: uploadResult ? uploadResult.secure_url : null,
      img_id: uploadResult ? uploadResult.public_id : null,
    };

    if (!errors.isEmpty()) {
      const categories = await getAllRows("categories");
      return res.render("material_form", {
        page_title: "Update Material",
        material: material,
        categories: categories,
        errors: errors.array(),
      });
    } else {
      const updatedMaterial = await updateMaterial(req.params.id, material);

      if (!updatedMaterial && !updatedMaterial.id) {
        const error = new Error("Material not found.");
        error.status = 404;
        console.error("Material_Update: Material not found.", error.stack);
        return next(createError(404, `Material:${mat_name} not found.`));
      }
      return res.redirect(`/store/material/${updatedMaterial.id}`);
    }
  }),
];
