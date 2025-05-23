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

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById }
