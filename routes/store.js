const express = require("express");
const router = express.Router();
const multer = require("multer");

// Bring in all controller modules.
const category_controller = require("../controllers/categoryController");
const location_controller = require("../controllers/locationController");
const material_controller = require("../controllers/materialController");
const verifyController = require("../controllers/verifyController");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/// CATEGORY ROUTES ///

// Verification route
router.post("/verify-password", verifyController);

// GET/POST request for creating category
router.get("/category/create", category_controller.category_create_get);
router.post(
  "/category/create",
  upload.single("image"),
  category_controller.category_create_post
);

// GET/POST request for deleting category
router.get(
  "/category/:id/delete",

  category_controller.category_get_delete
);
router.post(
  "/category/:id/delete",

  category_controller.category_post_delete
);

// GET/POST request for updating category
router.get(
  "/category/:id/update",

  category_controller.category_get_update
);
router.post(
  "/category/:id/update",

  category_controller.category_post_update
);

// GET single category
router.get("/category/:id", category_controller.category_detail);

// GET all Categorys
router.get("/category", category_controller.category_list);

/// LOCATION ROUTES ///

// GET/POST request for creating location.
router.get("/location/create", location_controller.location_get_create);
router.post("/location/create", location_controller.location_post_create);

// GET/POST request for deleting location.
router.get(
  "/location/:id/delete",

  location_controller.location_get_delete
);
router.post(
  "/location/:id/delete",

  location_controller.location_post_delete
);

// GET/POST request for updating location.
router.get(
  "/location/:id/update",

  location_controller.location_get_update
);
router.post(
  "/location/:id/update",

  location_controller.location_post_update
);

// GET single location.
router.get("/location/:id", location_controller.location_detail);

// GET all locations
router.get("/location", location_controller.location_list);

/// MATERIAL ROUTES ///

// GET/POST request for creating material.
router.get("/material/create", material_controller.material_get_create);
router.post(
  "/material/create",
  upload.single("image"),
  material_controller.material_post_create
);

// GET/POST request for deleting material
router.get(
  "/material/:id/delete",

  material_controller.material_get_delete
);
router.post(
  "/material/:id/delete",

  material_controller.material_post_delete
);

// GET/POST request for updating material
router.get(
  "/material/:id/update",

  material_controller.material_get_update
);
router.post(
  "/material/:id/update",

  upload.single("image"),
  material_controller.material_post_update
);

// GET single material
router.get("/material/:id", material_controller.material_detail);

// GET all materials
router.get("/material", material_controller.material_list);

module.exports = router;
