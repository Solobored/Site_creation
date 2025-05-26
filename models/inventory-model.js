const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data
  } catch (error) {
    console.error("getClassifications error " + error)
    throw error
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id],
    )

    // If no data is returned
    if (data.rows.length === 0) {
      return []
    }

    // Process image paths to ensure they work correctly
    data.rows = data.rows.map((vehicle) => {
      // Check if the image paths start with /images
      if (vehicle.inv_image && !vehicle.inv_image.startsWith("/images/vehicles/")) {
        vehicle.inv_image = `/images/vehicles/${vehicle.inv_image.split("/").pop()}`
      }
      if (vehicle.inv_thumbnail && !vehicle.inv_thumbnail.startsWith("/images/vehicles/")) {
        vehicle.inv_thumbnail = `/images/vehicles/${vehicle.inv_thumbnail.split("/").pop()}`
      }
      return vehicle
    })

    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
    throw error
  }
}

/* ***************************
 *  Get vehicle details by inventory_id
 * ************************** */
async function getVehicleById(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inventory_id],
    )

    if (!data.rows[0]) {
      return null
    }

    // Process image paths to ensure they work correctly
    const vehicle = data.rows[0]
    if (vehicle.inv_image && !vehicle.inv_image.startsWith("/images/vehicles/")) {
      vehicle.inv_image = `/images/vehicles/${vehicle.inv_image.split("/").pop()}`
    }
    if (vehicle.inv_thumbnail && !vehicle.inv_thumbnail.startsWith("/images/vehicles/")) {
      vehicle.inv_thumbnail = `/images/vehicles/${vehicle.inv_thumbnail.split("/").pop()}`
    }

    return vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error)
    throw error
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("addClassification error: " + error)
    return error.message
  }
}

/* ***************************
 *  Check if classification exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add new vehicle to inventory
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id,
) {
  try {
    const sql = `INSERT INTO inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ])
  } catch (error) {
    console.error("addInventory error: " + error)
    return error.message
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  checkExistingClassification,
  addInventory,
}
