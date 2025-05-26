const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up CSE Motors application...")

// Check if middleware directory exists
const middlewareDir = path.join(__dirname, "middleware")
if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir, { recursive: true })
  console.log("✅ Created middleware directory")
}

// Check if views/inventory directory exists
const inventoryViewsDir = path.join(__dirname, "views", "inventory")
if (!fs.existsSync(inventoryViewsDir)) {
  fs.mkdirSync(inventoryViewsDir, { recursive: true })
  console.log("✅ Created views/inventory directory")
}

// Install dependencies
console.log("📦 Installing dependencies...")
try {
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencies installed successfully")
} catch (error) {
  console.error("❌ Error installing dependencies:", error.message)
  process.exit(1)
}

console.log("🎉 Setup complete! You can now run: npm start")
