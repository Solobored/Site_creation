// Test file to check if validation module loads correctly
try {
  const validate = require("./middleware/validation")
  console.log("✅ Validation module loaded successfully")
  console.log("Available functions:", Object.keys(validate))

  // Test if functions exist
  if (typeof validate.classificationRules === "function") {
    console.log("✅ classificationRules function exists")
  } else {
    console.log("❌ classificationRules function missing")
  }

  if (typeof validate.inventoryRules === "function") {
    console.log("✅ inventoryRules function exists")
  } else {
    console.log("❌ inventoryRules function missing")
  }
} catch (error) {
  console.error("❌ Error loading validation module:", error.message)
}
