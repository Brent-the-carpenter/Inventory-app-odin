#!/usr/bin/env node -S

console.log(
  'This script populates some building material categories, locations, materials, and stores to your database. Specified database as argument - e.g: node populateDB "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

// Import Schema Models
const Category = require("./models/category");
const Location = require("./models/location");
const Material = require("./models/material");
const Store = require("./models/store");

// Define empty arrays to push items into after successful creation to get object id for next model
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
  "Sunday",
];

// Import Mongoose and set up
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

// Import MongoDB uri from env file if applicable
const mongoDB = process.env.MONGO_URI || userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect to the database");
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Debug: Connected to the database");
  } catch (err) {
    console.error("Error: Failed to connect to the database", err);
    process.exit(1);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await createStores(session); // Create the stores first
    await createLocations(session); // Create the locations
    await createCategories(session); // Create the categories
    console.log("Debug: Categories created:", categories); // Add logging here
    await createMaterials(session); // Create the materials
    await updateRefs(session); // Update references if needed

    await session.commitTransaction();
    console.log("Debug: Transaction committed");
  } catch (err) {
    await session.abortTransaction();
    console.log(`Debug: Transaction aborted due to error: ${err}`);
  } finally {
    await session.endSession();
    await mongoose.connection.close();
    console.log("Debug: Mongoose connection closed");
  }
}

// Write functions for each model to make a new document
async function storeCreate(index, name, date_opened, session) {
  const storeDetail = {
    name: name,
    date_opened: date_opened,
    locations: [], // Initialize with empty array
    categories: [], // Initialize with empty array
  };
  const store = new Store(storeDetail);
  await store.save({ session });
  stores[index] = store;
  console.log(`Added store: ${name}`);
}

async function locationCreate(
  index,
  state,
  address,
  store,
  phoneNumber,
  open,
  session
) {
  if (!store || !store._id) {
    throw new Error(`Store is undefined or has no _id at index ${index}`);
  }

  const locationDetail = {
    state: state,
    address: address,
    store: store._id, // ref
    phoneNumber: phoneNumber, // string
    open: open, // takes an array of weekdays
  };
  const location = new Location(locationDetail);
  await location.save({ session });
  locations[index] = location;
  store.locations.push(location._id); // Update store with the new location reference
  await store.save({ session }); // Save the store after updating
  console.log(`Added location: ${address}, ${state}`);
}

async function categoryCreate(index, name, summary, store, session) {
  if (!store || !store._id) {
    throw new Error(`Store is undefined or has no _id at index ${index}`);
  }

  const categoryDetail = {
    name: name,
    summary: summary,
    materials: [], // takes array of materials
    store: store._id, // ref
  };
  const category = new Category(categoryDetail);
  await category.save({ session });
  categories[index] = category;
  store.categories.push(category._id); // Update store with the new category reference
  await store.save({ session }); // Save the store after updating
  console.log(`Added category: ${name}`);
}

async function materialCreate(index, name, stock, price, category, session) {
  if (!category || !category._id) {
    throw new Error(
      `Material: Category ${category} is undefined or has no _id at index: ${index}`
    );
  }

  const materialDetail = {
    name: name,
    stock: stock,
    category: category._id,
    price: price,
  };
  const material = new Material(materialDetail);
  await material.save({ session });
  materials[index] = material;
  category.materials.push(material._id); // Update category with the new material reference
  await category.save({ session }); // Save the category after updating
  console.log(`Added material: ${name}`);
}

// Write functions to use previously defined "Module"Create functions to make multiple documents for each collection
async function createStores(session) {
  console.log("Adding Stores");
  await storeCreate(0, "Bobs Lumber", new Date("2012-04-20"), session);
  await storeCreate(1, "Tile World", new Date("1997-01-01"), session);
  await storeCreate(2, "Sheetz", new Date("2021-04-20"), session);
}

async function createLocations(session) {
  console.log("Adding Locations");
  await locationCreate(
    0,
    "GA",
    "1920 Marietta Street, Marietta",
    stores[0],
    "645-345-5555",
    open.slice(1, 5),
    session
  );
  await locationCreate(
    1,
    "NY",
    "123 Broadway, New York",
    stores[1],
    "123-456-7890",
    open,
    session
  );
  await locationCreate(
    2,
    "CA",
    "456 Hollywood Blvd, Los Angeles",
    stores[2],
    "987-654-3210",
    open,
    session
  );
}

async function createCategories(session) {
  console.log("Adding Categories");
  await categoryCreate(
    0,
    "Drywall",
    "This category contains all materials related to drywall work.",
    stores[0],
    session
  );
  await categoryCreate(
    1,
    "Framing",
    "This category contains all materials related to framing work.",
    stores[0],
    session
  );
  await categoryCreate(
    2,
    "Tile",
    "This category contains all materials related to tile work.",
    stores[1],
    session
  );
  await categoryCreate(
    3,
    "Cabinet",
    "This category contains all materials related to cabinet work.",
    stores[2],
    session
  );
}

async function createMaterials(session) {
  console.log("Adding Materials");
  console.log("Debug: Creating materials with categories:", categories); // Add logging here
  if (categories.length < 4) {
    throw new Error("Categories array does not have enough elements.");
  }
  await materialCreate(
    0,
    "1/2 inch 4x8 drywall",
    100,
    12,
    categories[0],
    session
  );
  await materialCreate(1, "2x4x8 Stud", 200, 5, categories[1], session);
  await materialCreate(2, "Tile Adhesive", 50, 8, categories[2], session);
  await materialCreate(3, "Cabinet Knob", 100, 2, categories[3], session);
  await materialCreate(4, "Drywall Screws", 500, 1, categories[0], session);
  await materialCreate(5, "Framing Nails", 300, 3, categories[1], session);
}

async function updateRefs(session) {
  // Add any additional reference updates here if needed
}
