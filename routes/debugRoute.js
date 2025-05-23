const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const invModel = require("../models/inventory-model")

// Route to check image paths
router.get("/check-images", async (req, res) => {
  try {
    // Get all inventory items
    const pool = require("../database")
    const result = await pool.query("SELECT inv_id, inv_make, inv_model, inv_image, inv_thumbnail FROM inventory")

    // Check each image path
    const imageStatus = await Promise.all(
      result.rows.map(async (item) => {
        const imagePath = path.join(__dirname, "..", "public", item.inv_image)
        const thumbnailPath = path.join(__dirname, "..", "public", item.inv_thumbnail)

        const imageExists = fs.existsSync(imagePath)
        const thumbnailExists = fs.existsSync(thumbnailPath)

        return {
          id: item.inv_id,
          make: item.inv_make,
          model: item.inv_model,
          imagePath: item.inv_image,
          thumbnailPath: item.inv_thumbnail,
          imageExists,
          thumbnailExists,
          publicImageUrl: `/images/vehicles/${path.basename(item.inv_image)}`,
          publicThumbnailUrl: `/images/vehicles/${path.basename(item.inv_thumbnail)}`,
        }
      }),
    )

    // Check directory structure
    const imagesDir = path.join(__dirname, "..", "public", "images")
    const vehiclesDir = path.join(imagesDir, "vehicles")

    const dirStatus = {
      imagesDir: {
        path: imagesDir,
        exists: fs.existsSync(imagesDir),
      },
      vehiclesDir: {
        path: vehiclesDir,
        exists: fs.existsSync(vehiclesDir),
      },
    }

    if (dirStatus.vehiclesDir.exists) {
      dirStatus.vehiclesDir.files = fs.readdirSync(vehiclesDir)
    }

    res.render("debug/check-images", {
      title: "Image Path Checker",
      nav: await invModel.getClassifications(),
      imageStatus,
      dirStatus,
    })
  } catch (error) {
    console.error("Error in check-images route:", error)
    res.status(500).send("Error checking image paths: " + error.message)
  }
})

module.exports = router
