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

exports.deleteRow = async function (table, id) {
  if (!validTableNames.includes(table)) {
    throw invalidTable(table);
  }
  const result = await db.query(
    `DELETE FROM ${table} WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
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
exports.checkForCategory = async function (name) {
  try {
    const result = await db.query(
      `SELECT * FROM categories WHERE cat_name = $1`,
      [name]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error category with name: ${name} already exist.`);
    throw error;
  }
};
exports.addCategory = async function (category) {
  try {
    const { cat_name, summary, store_id } = category;
    const result = await db.query(
      `INSERT INTO categories(cat_name , summary , store_id) Values($1,$2,$3) RETURNING *`,
      [cat_name, summary, store_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error inserting new category , Error : ${error.message}`);
    throw error;
  }
};
exports.checkForLinkedMaterials = async function (cat_id) {
  const results = await db.query(
    `SELECT * FROM materials WHERE category_id = $1 ;`,
    [cat_id]
  );
  return results.rows;
};
exports.deleteCategory = async function (id) {
  try {
    const result = await db.query(
      `DELETE FROM categories WHERE id = $1 RETURNING *;`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error deleting category with id: ${id}`);
    throw error;
  }
};

exports.updateCategory = async function (category, id) {
  try {
    const { cat_name, summary, store_id } = category;
    const result = await db.query(
      `UPDATE categories SET cat_name = $1 , summary = $2 , store_id = $3 WHERE id = $4 RETURNING *;`,
      [cat_name, summary, store_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Failed to update category:${category.cat_name}`);
    throw error;
  }
};

// Material specific queries
exports.getCategoryOfMaterial = async function (id) {
  try {
    const result = await db.query(`SELECT * FROM categories WHERE id = $1 ;`, [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error finding category with id of ${id}`);
    throw error;
  }
};

exports.checkForMaterial = async function (name) {
  try {
    const result = await db.query(
      `Select * FROM materials WHERE mat_name = $1`,
      [name]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error checking for material name. Error${error}`);
    throw error;
  }
};

exports.addMaterial = async function (material) {
  try {
    console.log(material, "materials");
    const { mat_name, stock, category_id, price, img_url, img_id } = material;

    const results = await db.query(
      `INSERT INTO materials(mat_name, stock, category_id, price, img_url, img_id)
       VALUES($1, $2, $3, $4, COALESCE($5, 'No image'), COALESCE($6, 'NA'))
       RETURNING *;`,
      [mat_name, stock, category_id, price, img_url, img_id]
    );

    return results.rows[0];
  } catch (error) {
    console.error(`Error inserting new material ${material.cat_name} in db.`);
    throw error;
  }
};

exports.deleteMaterial = async function (id) {
  try {
    const result = await db.query(
      `DELETE FROM materials WHERE id = $1 RETURNING * ;`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error deleting material id: ${id}.`, 500);
    throw error;
  }
};

exports.updateMaterial = async function (id, update) {
  try {
    const { mat_name, stock, category_id, price, img_url, img_id } = update;
    const result = await db.query(
      `UPDATE materials SET mat_name = $1 , stock = $2 , category_id = $3 , price = $4 , img_url = COALESCE($5 , 'No image'), img_id = COALESCE($6 , 'NA') WHERE id = $7 RETURNING *`,
      [mat_name, stock, category_id, price, img_url, img_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating material with id ${id}`);
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

exports.checkForLocation = async function (address) {
  try {
    const result = await db.query(
      `SELECT * FROM locations WHERE address = $1 ; `,
      [address]
    );
    console.log(result.rows);
    return result.rows[0];
  } catch (error) {
    console.error(`Error checking for location . Error:${error.message}`);
    throw error;
  }
};
exports.addLocation = async function (location) {
  try {
    const { state, address, phoneNumber, open, zip, store_id } = location;
    const result = await db.query(
      `INSERT INTO locations(state , address, phone_number , open, zip_code , store_id)  VALUES($1 ,$2 , $3 , $4 , $5, $6 ) RETURNING *`,
      [state, address, phoneNumber, open, zip, store_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Error adding location to database , Error: ${error}`);
    throw error;
  }
};
exports.updateLocation = async function (table, id, update) {
  if (!validTableNames.includes(table)) {
    throw invalidTable(table);
  }
  const { state, address, phoneNumber, open, zip, store_id } = update;
  const result = await db.query(
    `UPDATE ${table} 
    SET state = $1 ,
    address = $2,
    phone_number = $3 ,
    open = $4 , 
    zip_code = $5 ,
    store_id = $6   
    WHERE id = $7 
    RETURNING *`,
    [state, address, phoneNumber, open, zip, store_id, id]
  );
  return result.rows[0];
};
