const { Pool } = require("pg")
require("dotenv").config()

let pool

try {
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env file")
  }

  // Always use SSL for external services like Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  // Test the connection
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("❌ Database connection test failed:", err)
    } else {
      console.log("✅ Database connected successfully at:", res.rows[0].now)
    }
  })
} catch (error) {
  console.error("❌ Error setting up database connection:", error.message)
}

module.exports = pool
