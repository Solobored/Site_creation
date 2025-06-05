require("dotenv").config()
const { Pool } = require("pg")

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...")
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "Set (hidden for security)" : "NOT SET"}`)

  // Parse the connection string to show parts without exposing password
  try {
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL)
      console.log(`Host: ${url.hostname}`)
      console.log(`Port: ${url.port || "default"}`)
      console.log(`Database: ${url.pathname.substring(1)}`)
      console.log(`Username: ${url.username}`)
      console.log(`Password: ${url.password ? "Set (hidden)" : "NOT SET"}`)
    }
  } catch (parseError) {
    console.log(`Error parsing DATABASE_URL: ${parseError.message}`)
    console.log("Make sure your DATABASE_URL is in the format: postgres://username:password@hostname:port/database")
  }

  // Try connecting with SSL disabled
  try {
    console.log("\n🔄 Attempting connection WITHOUT SSL...")
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    })

    const result = await pool.query("SELECT NOW() as time")
    console.log("✅ Connection successful!")
    console.log(`Server time: ${result.rows[0].time}`)
    await pool.end()
  } catch (error) {
    console.log(`❌ Connection failed without SSL: ${error.message}`)
  }

  // Try connecting with SSL but reject unauthorized disabled
  try {
    console.log("\n🔄 Attempting connection with SSL (rejectUnauthorized: false)...")
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    const result = await pool.query("SELECT NOW() as time")
    console.log("✅ Connection successful!")
    console.log(`Server time: ${result.rows[0].time}`)
    await pool.end()
  } catch (error) {
    console.log(`❌ Connection failed with SSL: ${error.message}`)
  }

  // Try connecting with default settings
  try {
    console.log("\n🔄 Attempting connection with default settings...")
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const result = await pool.query("SELECT NOW() as time")
    console.log("✅ Connection successful!")
    console.log(`Server time: ${result.rows[0].time}`)
    await pool.end()
  } catch (error) {
    console.log(`❌ Connection failed with default settings: ${error.message}`)
  }

  console.log("\n📋 Troubleshooting steps:")
  console.log("1. Check if the database server is running")
  console.log("2. Verify the hostname is correct and accessible")
  console.log("3. Check if your IP is allowed in the database firewall settings")
  console.log("4. Try using a different network (some networks block database ports)")
  console.log("5. For Render.com databases, make sure your database service is active")
}

testDatabaseConnection()
