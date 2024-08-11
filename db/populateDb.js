#!/user/bin/env node --env-file=.env

const { Client } = require("pg");
const path = require("path");
const fs = require("fs/promises");
const mongoose = require("mongoose");

// Import Mongo models.
const Category = require("../models/category");
const Location = require("../models/location");
const Material = require("../models/material");
const Store = require("../models/store");

// Setup Mongoose
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

//Define empty arrays to push items into after successful creation.
let categories;
let locations;
let materials;
let stores;

async function getDataFromMongoDb() {
  try {
    console.log(`Connecting to MongoDb at ${mongoDB}.`);
    await mongoose.connect(mongoDB);
    stores = await Store.find({}).populate(["locations", "categories"]).exec();
    materials = await Material.find({}).populate("category").exec();
    categories = await Category.find({}).populate("store").exec();
    locations = await Location.find({}).exec();
  } catch (error) {
    console.log(`Error getting data from mongoDb. ERROR: ${error}`);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    console.log(`Successfully connected to DB.`);
    await insertDataIntoPostgres(client);
  } catch (error) {
    console.log(`Failed to connect to postgres db. ERROR: ${error}`);
  } finally {
    await client.end();
    console.log(`Connection closed.`);
  }
}

async function insertDataIntoPostgres(client) {
  try {
    // Set up table schemas
    const tableSchemas = path.join(__dirname, "schemas/tables.sql");
    const tableCreation = await fs.readFile(tableSchemas, "utf-8");
    await client.query(`BEGIN `);
    await client.query(tableCreation);
    console.log(
      "Tables :  Stores , Categories , Locations and Materials Have been created."
    );
    // Start Inserting data from mongoDB.

    // Insert store data
    await insertStores(client);
    // Migrate locations to postgres
    await insertLocations(client);
    // Migrate categories over to postgres
    await insertCategories(client);
    // Migrate materials into the db =)
    await insertMaterials(client);

    await client.query(`COMMIT`);
  } catch (error) {
    console.log(`Error populating db ${error}`);
    await client.query(`ROLLBACK`);
    console.log(`Transaction rolled back.`);
    throw error;
  }
}

async function insertStores(client) {
  try {
    for (const store of stores) {
      await client.query(
        `INSERT INTO stores(name , date_opened) Values($1 , $2)`,
        [store.name, store.date_opened]
      );
    }
  } catch (error) {
    throw error;
  }
}

async function insertLocations(client) {
  try {
    for (const location of locations) {
      const locationStore = stores.find((store) =>
        store.locations.some(
          (locId) => locId._id.toString() === location._id.toString()
        )
      );
      if (locationStore) {
        const result = await client.query(
          `SELECT id FROM stores WHERE name = $1 `,
          [locationStore.name]
        );

        const storeId = result.rows[0]?.id;

        if (storeId) {
          await client.query(
            `INSERT INTO locations(state , address, phone_number , open, zip_code , store_id) 
      VALUES($1 , $2 , $3 , $4 , $5 , $6 )`,
            [
              location.state,
              location.address,
              location.phoneNumber,
              location.open,
              location?.zip || "30135",
              storeId,
            ]
          );
        } else {
          console.log(`No store found with the name: ${locationStore.name}`);
        }
      } else {
        console.log(`No matching store found for location: ${location._id}`);
      }
    }
  } catch (error) {
    console.log(`Failed in migrating locations error: ${error}`);
    throw error;
  }
}

async function insertCategories(client) {
  try {
    for (const category of categories) {
      const storeName = category.store.name;

      if (storeName) {
        const result = await client.query(
          `SELECT id FROM stores WHERE name = $1`,
          [storeName]
        );
        const store_id = result.rows[0]?.id;
        if (store_id) {
          await client.query(
            `INSERT INTO categories(cat_name , summary , store_id) 
        Values($1 , $2 ,$3)`,
            [category.name, category.summary, store_id]
          );
        } else {
          console.log(`No Id that matches ${store_id}`);
        }
      } else {
        console.log(`No Stores with name: ${storeName} in Database. `);
        throw error;
      }
    }
  } catch (error) {
    console.log(`Failed to migrate categories error: ${error}`);
  }
}

async function insertMaterials(client) {
  try {
    for (const material of materials) {
      const materialCategory = categories.find((category) =>
        category.materials.some(
          (materialId) => material.id.toString() === materialId.toString()
        )
      );

      if (materialCategory) {
        const result = await client.query(
          `SELECT id FROM categories WHERE cat_name = $1`,
          [materialCategory.name]
        );
        const category_id = result.rows[0]?.id;
        if (category_id) {
          await client.query(
            `INSERT INTO materials(mat_name , stock , price , category_id , img_url , img_id)
      VALUES($1 ,$2,$3, $4 , $5, $6)`,
            [
              material.name,
              material.stock,
              material.price,
              category_id,
              material.image.url,
              material.image.public_id,
            ]
          );
        } else {
          console.log(`No category with id ${category_id} found`);
        }
      } else {
        console.log(`No category with ID: ${materialCategory} found.`);
      }
    }
  } catch (error) {
    console.log(`Failed to migrate material error: ${error}`);
    throw error;
  }
}

async function startMigration() {
  try {
    await getDataFromMongoDb();
    await main();
    console.log(`Migration completed!`);
  } catch (error) {
    console.log(error);
  }
}

startMigration();
