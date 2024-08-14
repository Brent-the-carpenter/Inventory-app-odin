const db = require("./pool");

const validTableNames = ["categories", "stores", "locations", "materials"];

// GENERAL queries

const invalidTable = (table) => {
  return new Error(`Invalid table name : ${table}`);
};

exports.getAllRows = async function (table) {
  if (!validTableNames.includes(table)) {
    throw invalidTable(table);
  }
  try {
    const result = await db.query(`SELECT * FROM ${table}`);
    return result.rows;
  } catch (error) {
    console.log(
      `Error getting all rows from ${table}. Error : ${error.message}`
    );
    throw error;
  }
};

exports.getRow = async function (table, id) {
  if (!validTableNames.includes(table)) {
    throw invalidTable(table);
  }
  try {
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error finding category with id:${id} from table:${table}`);
    throw error;
  }
};

exports.countRows = async function (table) {
  if (!validTableNames.includes(table)) {
    throw invalidTable(table);
  }
  try {
    const result = await db.query(`Select COUNT(id) as count FROM ${table}`);
    return result.rows[0].count;
  } catch (error) {
    console.error(
      `Error getting count of rows from table: ${table}, Error: ${error.message}`
    );
    throw error;
  }
};

// Categories specific queries
exports.getMaterialInCategory = async function (id) {
  try {
    const result = await db.query(
      `SELECT * FROM materials WHERE category_id = $1`,
      [id]
    );
    return result.rows;
  } catch (error) {
    console.error(`Error finding materials from category where id is ${id}`);
    throw error;
  }
};

// Material specific queries
exports.getCategoryOfMaterial = async function (id) {
  try {
    const result = await db.query(`SELECT * FROM categories WHERE id = $1`, [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error finding category with id of ${id}`);
    throw error;
  }
};

// Location specific queries

exports.getLocationsByState = async function () {
  try {
    const result = await db.query(
      `SELECT state , 
    COUNT(id) as count , 
    ARRAY_AGG(json_build_object('address' , address , 'phone_number' , phone_number , 'id' , id)) as locations 
    FROM locations GROUP BY state ; `
    );
    return result.rows;
  } catch (error) {
    console.error(`Error getting rows from locations , Error${error.message}`);
    throw error;
  }
};
