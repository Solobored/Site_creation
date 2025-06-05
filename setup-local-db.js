require("dotenv").config()
const { Pool } = require("pg")
const fs = require("fs")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function setupLocalDatabase() {
  console.log("🔧 Local Database Setup Helper")
  console.log("=" * 50)

  // Check if PostgreSQL is installed
  try {
    const { execSync } = require("child_process")
    const pgVersion = execSync("psql --version").toString()
    console.log(`✅ PostgreSQL detected: ${pgVersion.trim()}`)
  } catch (error) {
    console.log("❌ PostgreSQL not found or not in PATH")
    console.log("Please install PostgreSQL: https://www.postgresql.org/download/")
    process.exit(1)
  }

  // Get database connection info
  console.log("\n📝 Please provide your local PostgreSQL connection details:")

  const username = (await askQuestion("Username (default: postgres): ")) || "postgres"
  const password = await askQuestion("Password: ")
  const host = (await askQuestion("Host (default: localhost): ")) || "localhost"
  const port = (await askQuestion("Port (default: 5432): ")) || "5432"
  const database = (await askQuestion("Database name (default: cse_motors): ")) || "cse_motors"

  const connectionString = `postgres://${username}:${password}@${host}:${port}/${database}`

  // Test the connection
  console.log("\n🔄 Testing connection...")
  try {
    const pool = new Pool({ connectionString })
    await pool.query("SELECT NOW()")
    console.log("✅ Connection successful!")

    // Check if database exists, if not create it
    try {
      const dbCheck = await pool.query(`SELECT datname FROM pg_database WHERE datname = '${database}'`)
      if (dbCheck.rowCount === 0) {
        console.log(`Database '${database}' does not exist, creating...`)
        // Need to connect to postgres database to create a new database
        const pgPool = new Pool({
          connectionString: `postgres://${username}:${password}@${host}:${port}/postgres`,
        })
        await pgPool.query(`CREATE DATABASE ${database}`)
        await pgPool.end()
        console.log(`✅ Database '${database}' created`)
      } else {
        console.log(`✅ Database '${database}' already exists`)
      }
    } catch (error) {
      console.log(`❌ Error checking/creating database: ${error.message}`)
    }

    // Update .env file
    try {
      let envContent = ""
      if (fs.existsSync(".env")) {
        envContent = fs.readFileSync(".env", "utf8")
      }

      // Replace or add DATABASE_URL
      if (envContent.includes("DATABASE_URL=")) {
        envContent = envContent.replace(/DATABASE_URL=.*(\r?\n|$)/g, `DATABASE_URL=${connectionString}$1`)
      } else {
        envContent += `\nDATABASE_URL=${connectionString}`
      }

      fs.writeFileSync(".env", envContent)
      console.log("✅ Updated .env file with new DATABASE_URL")
    } catch (error) {
      console.log(`❌ Error updating .env file: ${error.message}`)
      console.log(`Please manually add this to your .env file: DATABASE_URL=${connectionString}`)
    }

    // Create tables
    console.log("\n🔄 Setting up database tables...")
    try {
      // Create account table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.account (
          account_id SERIAL PRIMARY KEY,
          account_firstname VARCHAR(50) NOT NULL,
          account_lastname VARCHAR(50) NOT NULL,
          account_email VARCHAR(100) UNIQUE NOT NULL,
          account_password VARCHAR(255) NOT NULL,
          account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin'))
        );
      `)
      console.log("✅ Account table created/verified")

      // Check if classification table exists
      const classCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'classification'
        );
      `)

      if (!classCheck.rows[0].exists) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.classification (
            classification_id SERIAL PRIMARY KEY,
            classification_name VARCHAR(50) NOT NULL UNIQUE
          );
        `)
        console.log("✅ Classification table created")
      } else {
        console.log("✅ Classification table already exists")
      }

      // Check if inventory table exists
      const invCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'inventory'
        );
      `)

      if (!invCheck.rows[0].exists) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.inventory (
            inv_id SERIAL PRIMARY KEY,
            inv_make VARCHAR(50) NOT NULL,
            inv_model VARCHAR(50) NOT NULL,
            inv_year INT NOT NULL,
            inv_description TEXT NOT NULL,
            inv_image VARCHAR(200) NOT NULL,
            inv_thumbnail VARCHAR(200) NOT NULL,
            inv_price NUMERIC(10,2) NOT NULL,
            inv_miles INT NOT NULL,
            inv_color VARCHAR(20) NOT NULL,
            classification_id INT NOT NULL REFERENCES public.classification(classification_id)
          );
        `)
        console.log("✅ Inventory table created")
      } else {
        console.log("✅ Inventory table already exists")
      }

      await pool.end()
    } catch (error) {
      console.log(`❌ Error setting up tables: ${error.message}`)
    }

    console.log("\n🎉 Local database setup complete!")
    console.log(`Your DATABASE_URL is: ${connectionString}`)
    console.log("You can now run the application with this local database.")
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    console.log("Please check your connection details and try again.")
  }

  rl.close()
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

setupLocalDatabase()
