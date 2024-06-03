#!/usr/bin/env node

console.log(
  'This script populates some building material categories , locations , materials and stores to your database . Specified database as argument - e.g: node populateDB "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

//Import Schema Models

const Category = require("./models/category");
const Location = require("./models/location");

const Material = require("./models/material");
const Store = require("./models/store");

// Define empty arrays to push items into after succesful creation to get object id for next model

const categories = [];
const locations = [];
const materials = [];
const stores = [];

const open = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Import Mongoose and set up
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

// Import MongoDB uri from env file if applicable

const mongoDB = process.env.MONGO_URI || userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug : Should be connected?");
  await createCategories(); // Create the categories first with empty reference arrays
  await createStores(); // Create the stores first with empty reference arrays for locations and update the categories with ref to stores
  await createLocations(); // create the locations and then update the stores referance arrays
  await createMaterials(); // create the materials and then update the categories
  await updateRefs();
  console.log("Debug: Closing Mongoose");
  await mongoose.connection.close();
}
// Write functions for each model to make a new document.

async function categoryCreate(index, name, summary) {
  const categoryDetail = {
    name: name,
    summary: summary,
    materials: [], // takes array of materials
    stores: [], // takes array of stores
  };
  const category = new Category(categoryDetail);
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function storeCreate(index, name, date_opened) {
  const storeDetail = {
    name: name,
    date_opened: date_opened,

    locations: [], // Intialize with empty array
    categories: [], // Intialize with empty array
  };
  const store = new Store(storeDetail);
  await store.save();
  stores[index] = store;
  console.log(`Added store: ${name}`);
}

async function locationCreate(index, state, address, store, phoneNumber, open) {
  const locationDetail = {
    state: state,
    address: address,
    store: store._id, //ref
    phoneNumber: phoneNumber, // string
    open: open, // takes and array of weekdays
  };
  const location = new Location(locationDetail);
  await location.save();
  locations[index] = location;
  console.log(`Added location: ${address} , ${state}`);
}

async function materialCreate(index, name, price, stock, category) {
  const materialDetail = {
    name: name,
    price: price,
    stock: stock,
    category: category._id,
  };
  const material = new Material(materialDetail);
  await material.save();
  materials[index] = material;
  console.log(`Added material: ${name}`);
}

// Write functions to use previously defined "Module"Create functions to make multiple documents for each collection.

async function createCategories() {
  console.log("Adding Categories");
  await Promise.all([
    categoryCreate(
      0,
      "Drywall",
      "This catagory contains all materials related to drywall work."
    ),
    categoryCreate(
      1,
      "Framing ",
      "This catagory contains all material related to framing work."
    ),
    categoryCreate(
      2,
      "Tile",
      "This catagory contains all materials related to tile work."
    ),
    categoryCreate(
      3,
      "cabinet",
      "This catagory contains all materials related to cabinet work."
    ),
  ]);
}
async function createStores() {
  console.log("Adding Stores");
  await Promise.all([
    storeCreate(0, "Bobs Lumber", new Date("2012-04-20")),
    storeCreate(1, "Tile World", new Date("1997-01-1")),
    storeCreate(2, "Sheetz", new Date("2021-4-20")),
  ]);
}
async function createLocations() {
  console.log("Adding locations");
  await Promise.all([
    locationCreate(
      0,
      "Ga",
      "1920 Marietta street , Marietta",
      stores[0],
      "645-345-5555",
      open.slice(1, 5)
    ),
    locationCreate(
      1,
      "NY",
      "123 Broadway, New York",
      stores[1],
      "123-456-7890",
      open
    ),
    locationCreate(
      2,
      "CA",
      "456 Hollywood Blvd, Los Angeles",
      stores[2],
      "987-654-3210",
      open
    ),
  ]);
}
async function createMaterials() {
  console.log("Adding Materials");
  await Promise.all([
    materialCreate(0, " 1/2inch 4x8 drywall", 12, 100, categories[0]),
    materialCreate(1, "2x4x8 Stud", 5, 200, categories[1]),
    materialCreate(2, "Tile Adhesive", 8, 50, categories[2]),
    materialCreate(3, "Cabinet Knob", 2, 100, categories[3]),
    materialCreate(4, "Drywall Screws", 1, 500, categories[0]),
    materialCreate(5, "Framing Nails", 3, 300, categories[1]),
  ]);

  // Update categories with materials after they are created
  categories[0].materials.push(materials[0]._id, materials[4]._id);
  categories[1].materials.push(materials[1]._id, materials[5]._id);
  categories[2].materials.push(materials[2]._id);
  categories[3].materials.push(materials[3]._id);
  await categories[0].save();
  await categories[1].save();
  await categories[2].save();
  await categories[3].save();
}

async function updateRefs() {
  stores[0].categories = [categories[0]._id, categories[1]._id];
  categories[0].stores = [stores[0]._id];

  stores[1].categories = [categories[2]._id];
  categories[2].stores = [stores[1]._id];

  stores[2].categories = [categories[0]._id, categories[3]._id];
  categories[0].stores.push(stores[2]._id);
  categories[3].stores = [stores[2]._id];
  await stores[0].save();
  await stores[1].save();
  await stores[2].save();
  await categories[0].save();
  await categories[2].save();
  await categories[3].save();
}
