const db = require("./pool");

exports.GetAllRows = async function (table) {
  const validTableNames = ["categories", "stores", "locations", "materials"];
  if (!validTableNames.includes(table)) {
    throw new Error(`Invalid table name : ${table}`);
  }
  const result = await db.query(`SELECT * FROM ${table}`);
  return result.rows;
};
