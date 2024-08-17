const asyncHandler = require("express-async-handler");

const { countRows } = require("../db/quires");
// Refactor to postgres on index done!
exports.index = asyncHandler(async (req, res, next) => {
  try {
    const [locations, categories, materials] = await Promise.all([
      await countRows("locations"),
      await countRows("categories"),
      await countRows("materials"),
    ]);
    const dateToday = new Date().getFullYear();

    res.render("index", {
      title: "The Better Choice for Building Supplies",
      location_count: locations,
      category_count: categories,
      material_count: materials,
      date: dateToday,
    });
  } catch (error) {
    res.render("error", {
      title: "The Better Choice for Building Supplies",
      date: new Date().getFullYear(),
      message: error.message,
    });
  }
});
