require("dotenv").config()
const { Pool } = require("pg")

async function testConnection() {
  console.log("Testing database connection...")
  console.log(`Using connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ":****@")}`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log("Attempting to connect to database...")
    const result = await pool.query("SELECT NOW()")
    console.log("✅ Connection successful!")
    console.log(`Server time: ${result.rows[0].now}`)

    // Test if tables exist
    try {
      console.log("\nChecking for required tables...")
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('classification', 'inventory', 'account')
      `)

      const tableNames = tables.rows.map((row) => row.table_name)
      console.log("Found tables:", tableNames.join(", "))

      if (tableNames.includes("classification")) {
        const classCount = await pool.query("SELECT COUNT(*) FROM classification")
        console.log(`Classification table has ${classCount.rows[0].count} records`)
      }

      if (tableNames.includes("inventory")) {
        const invCount = await pool.query("SELECT COUNT(*) FROM inventory")
        console.log(`Inventory table has ${invCount.rows[0].count} records`)
      }
    } catch (err) {
      console.error("❌ Error checking tables:", err.message)
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message)
    console.log("\nPossible solutions:")
    console.log("1. Make sure PostgreSQL is running")
    console.log("2. Check your username and password")
    console.log("3. Verify the database exists")
    console.log("4. Check if PostgreSQL is listening on the specified port")
  } finally {
    await pool.end()
  }
}

testConnection()
