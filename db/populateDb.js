#!/user/bin/env node --env-file=.env

const { Client } = require("pg");
const path = require("path");
const fs = require("fs/promises");
//Define empty arrays to push items into after successful creation.
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

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    Console.log(`Successfully connected to DB.`);

    // Set up table schemas
    const tableSchemas = path.join(__dirname, "schemas/tables.sql");
    const tableCreation = await fs.readFile(tableSchemas, "utf-8");
    await client.query(tableCreation);
    console.log(
      "Tables :  Stores , Categories , Locations and Materials Have been created."
    );
    //
  } catch (error) {
    console.log(`Error populating db ${error}`);
  } finally {
    await client.end();
    console.log(`Connection closed.`);
  }
}
