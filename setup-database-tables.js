require("dotenv").config()
const { Pool } = require("pg")
const bcrypt = require("bcryptjs")

async function setupDatabaseTables() {
  console.log("🔧 Setting up database tables...")

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    // Test connection
    console.log("🔄 Testing database connection...")
    const testResult = await pool.query("SELECT NOW() as time")
    console.log(`✅ Connected to database at: ${testResult.rows[0].time}`)

    // Check if account table exists
    console.log("\n📋 Checking if account table exists...")
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'account'
      );
    `)

    if (!tableCheck.rows[0].exists) {
      console.log("📝 Creating account table...")
      await pool.query(`
        CREATE TABLE public.account (
          account_id SERIAL PRIMARY KEY,
          account_firstname VARCHAR(50) NOT NULL,
          account_lastname VARCHAR(50) NOT NULL,
          account_email VARCHAR(100) UNIQUE NOT NULL,
          account_password VARCHAR(255) NOT NULL,
          account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin'))
        );
      `)
      console.log("✅ Account table created successfully")
    } else {
      console.log("✅ Account table already exists")
    }

    // Check if sample accounts exist
    console.log("\n👥 Checking for sample accounts...")
    const accountCount = await pool.query("SELECT COUNT(*) FROM account")
    console.log(`📊 Current account count: ${accountCount.rows[0].count}`)

    if (Number.parseInt(accountCount.rows[0].count) === 0) {
      console.log("📝 Creating sample accounts...")

      // Hash the password for sample accounts
      const hashedPassword = await bcrypt.hash("Pa$$w0rd", 10)
      console.log("🔒 Password hashed successfully")

      // Insert sample accounts
      await pool.query(
        `
        INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
        VALUES 
          ('Basic', 'User', 'basic@example.com', $1, 'Client'),
          ('Happy', 'Employee', 'happy@example.com', $1, 'Employee'),
          ('Admin', 'User', 'admin@example.com', $1, 'Admin')
      `,
        [hashedPassword],
      )

      console.log("✅ Sample accounts created successfully")
    } else {
      console.log("✅ Sample accounts already exist")
    }

    // List all accounts
    console.log("\n📋 Current accounts in database:")
    const accounts = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_id",
    )

    accounts.rows.forEach((acc) => {
      console.log(
        `   ${acc.account_id}: ${acc.account_firstname} ${acc.account_lastname} (${acc.account_email}) - ${acc.account_type}`,
      )
    })

    // Check other required tables
    console.log("\n📋 Checking other required tables...")

    const tables = ["classification", "inventory"]
    for (const tableName of tables) {
      const tableExists = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [tableName],
      )

      if (tableExists.rows[0].exists) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`)
        console.log(`✅ ${tableName} table exists with ${count.rows[0].count} records`)
      } else {
        console.log(`❌ ${tableName} table does not exist`)
      }
    }

    console.log("\n🎉 Database setup complete!")
    console.log("\n🔑 Test accounts you can use:")
    console.log("   Client: basic@example.com / Pa$$w0rd")
    console.log("   Employee: happy@example.com / Pa$$w0rd")
    console.log("   Admin: admin@example.com / Pa$$w0rd")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
  } finally {
    await pool.end()
  }
}

setupDatabaseTables()
