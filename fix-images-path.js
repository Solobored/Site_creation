require("dotenv").config()
const { Pool } = require("pg")

async function fixImagePaths() {
  console.log("Checking and fixing image paths in the database...")

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    // Get all inventory items
    const result = await pool.query("SELECT inv_id, inv_image, inv_thumbnail FROM inventory")
    console.log(`Found ${result.rows.length} inventory items to check`)

    let updatedCount = 0

    // Check each item and fix paths if needed
    for (const item of result.rows) {
      let needsUpdate = false
      let newImage = item.inv_image
      let newThumbnail = item.inv_thumbnail

      // Check if image path needs fixing
      if (item.inv_image && !item.inv_image.startsWith("/images/vehicles/")) {
        const filename = item.inv_image.split("/").pop()
        newImage = `/images/vehicles/${filename}`
        needsUpdate = true
      }

      // Check if thumbnail path needs fixing
      if (item.inv_thumbnail && !item.inv_thumbnail.startsWith("/images/vehicles/")) {
        const filename = item.inv_thumbnail.split("/").pop()
        newThumbnail = `/images/vehicles/${filename}`
        needsUpdate = true
      }

      // Update the database if needed
      if (needsUpdate) {
        await pool.query("UPDATE inventory SET inv_image = $1, inv_thumbnail = $2 WHERE inv_id = $3", [
          newImage,
          newThumbnail,
          item.inv_id,
        ])
        updatedCount++
        console.log(`Updated item ${item.inv_id}: 
          Image: ${item.inv_image} -> ${newImage}
          Thumbnail: ${item.inv_thumbnail} -> ${newThumbnail}`)
      }
    }

    console.log(`Updated ${updatedCount} items with fixed image paths`)
  } catch (err) {
    console.error("Error fixing image paths:", err.message)
  } finally {
    await pool.end()
  }
}

fixImagePaths()
