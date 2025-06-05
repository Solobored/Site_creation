const fs = require("fs")
const path = require("path")

console.log("🔧 Setting up Assignment 5...")

// Check and create required directories
const requiredDirs = ["models", "controllers", "routes", "middleware", "utilities", "views/account", "database"]

requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  } else {
    console.log(`📁 Directory exists: ${dir}`)
  }
})

// Check package.json dependencies
console.log("\n📦 Checking package.json dependencies...")
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
  const requiredDeps = {
    bcryptjs: "^2.4.3",
    jsonwebtoken: "^9.0.2",
    "cookie-parser": "^1.4.6",
    "express-validator": "^7.0.1",
  }

  const missingDeps = []

  Object.entries(requiredDeps).forEach(([dep, version]) => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      missingDeps.push(`${dep}@${version}`)
      console.log(`❌ Missing: ${dep}`)
    } else {
      console.log(`✅ Found: ${dep}`)
    }
  })

  if (missingDeps.length > 0) {
    console.log(`\n📝 Run this command to install missing dependencies:`)
    console.log(`npm install ${missingDeps.join(" ")}`)
  } else {
    console.log("\n✅ All required dependencies are present")
  }
} catch (error) {
  console.log("❌ Error reading package.json:", error.message)
}

// Check .env file
console.log("\n🔐 Checking environment variables...")
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8")
  const requiredVars = ["DATABASE_URL", "SESSION_SECRET", "ACCESS_TOKEN_SECRET"]

  requiredVars.forEach((envVar) => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar}: Found in .env`)
    } else {
      console.log(`❌ ${envVar}: Missing from .env`)
    }
  })
} else {
  console.log("❌ .env file not found")
}

console.log("\n🎉 Setup complete! Run 'node test-assignment5.js' to test the implementation.")
