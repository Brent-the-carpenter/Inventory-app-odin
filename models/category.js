const mongoose = require("mongoose");
const Schema = new mongoose.Schema();

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 50 },
  summary: { type: String, required: true, maxLength: 200 },
  materials: [{ type: Schema.Types.ObjectId, ref: "Material" }],
  stores: [{ type: Schema.Types.ObjectId, ref: "Store" }],
});
