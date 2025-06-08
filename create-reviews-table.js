require("dotenv").config()
const { Pool } = require("pg")

async function createReviewsTable() {
  console.log("🔧 Creating reviews table structure only...")

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

    // Drop existing table if it exists (optional - remove this if you want to keep existing data)
    console.log("\n🗑️ Dropping existing review table if it exists...")
    await pool.query("DROP TABLE IF EXISTS public.review CASCADE")

    // Create reviews table
    console.log("📝 Creating review table...")
    await pool.query(`
      CREATE TABLE public.review (
        review_id SERIAL PRIMARY KEY,
        review_text TEXT NOT NULL,
        review_rating INTEGER NOT NULL CHECK (review_rating BETWEEN 1 AND 5),
        review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
        account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_review_inv_id ON public.review(inv_id);
      CREATE INDEX idx_review_account_id ON public.review(account_id);
    `)
    console.log("✅ Review table created successfully")

    // Show table structure
    console.log("\n📋 Review table structure:")
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'review' 
      ORDER BY ordinal_position;
    `)

    tableInfo.rows.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === "YES" ? "nullable" : "not null"})`)
    })

    // Show available accounts and inventory for reference
    console.log("\n📊 Available accounts for testing:")
    const accounts = await pool.query("SELECT account_id, account_firstname, account_lastname, account_email FROM account ORDER BY account_id")
    accounts.rows.forEach((acc) => {
      console.log(`   ID ${acc.account_id}: ${acc.account_firstname} ${acc.account_lastname} (${acc.account_email})`)
    })

    console.log("\n📊 Available vehicles for testing:")
    const vehicles = await pool.query("SELECT inv_id, inv_make, inv_model, inv_year FROM inventory ORDER BY inv_id LIMIT 10")
    vehicles.rows.forEach((veh) => {
      console.log(`   ID ${veh.inv_id}: ${veh.inv_year} ${veh.inv_make} ${veh.inv_model}`)
    })

    console.log("\n🎉 Reviews table setup complete!")
    console.log("You can now manually add reviews through the application interface.")
  } catch (error) {
    console.error("❌ Error creating reviews table:", error)
  } finally {
    await pool.end()
  }
}

createReviewsTable()