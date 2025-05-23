const fs = require("fs")
const path = require("path")

// Create directories if they don't exist
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`Created directory: ${dirPath}`)
  } else {
    console.log(`Directory already exists: ${dirPath}`)
  }
}

// Create the main images directory and vehicles subdirectory
const imagesDir = path.join(__dirname, "public", "images")
const vehiclesDir = path.join(imagesDir, "vehicles")

createDir(imagesDir)
createDir(vehiclesDir)

console.log("Directory structure created successfully!")
