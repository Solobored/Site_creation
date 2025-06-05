const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for Render.com databases
 * *************** */
let pool
try {
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in .env file")
    console.log("Please set up your DATABASE_URL in the .env file")
    throw new Error("DATABASE_URL is not defined")
  }

  // Create the connection pool with SSL for Render.com
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  // Test the connection with proper error handling
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Database connection test failed:", err.message)
      console.log("Note: This might be a temporary connection issue. The app should still work.")
    } else {
      console.log("Database connected successfully at:", res.rows[0].now)
    }
  })
} catch (error) {
  console.error("Error setting up database connection:", error)
}

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

module.exports = pool
