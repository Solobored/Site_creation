require("dotenv").config()
const { Pool } = require("pg")

async function setupReviewsTable() {
  console.log("🔧 Setting up reviews table...")

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

    // Check if reviews table exists
    console.log("\n📋 Checking if review table exists...")
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'review'
      );
    `)

    if (!tableCheck.rows[0].exists) {
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
    } else {
      console.log("✅ Review table already exists")
    }

    // Check if sample reviews exist
    console.log("\n👥 Checking for sample reviews...")
    const reviewCount = await pool.query("SELECT COUNT(*) FROM review")
    console.log(`📊 Current review count: ${reviewCount.rows[0].count}`)

    if (Number.parseInt(reviewCount.rows[0].count) === 0) {
      console.log("📝 Creating sample reviews...")

      // Get some inventory IDs
      const inventoryResult = await pool.query("SELECT inv_id FROM inventory LIMIT 5")
      if (inventoryResult.rows.length === 0) {
        console.log("❌ No inventory items found. Cannot create sample reviews.")
      } else {
        // Get some account IDs
        const accountResult = await pool.query("SELECT account_id FROM account LIMIT 3")
        if (accountResult.rows.length === 0) {
          console.log("❌ No accounts found. Cannot create sample reviews.")
        } else {
          console.log(`📊 Found ${accountResult.rows.length} accounts and ${inventoryResult.rows.length} vehicles`)

          // Create sample reviews using actual IDs from the database
          const sampleReviews = [
            {
              text: "This vehicle is amazing! The handling is smooth and the interior is luxurious.",
              rating: 5,
              inv_id: inventoryResult.rows[0].inv_id,
              account_id: accountResult.rows[0].account_id,
            },
            {
              text: "Good car but a bit overpriced for what you get. The fuel economy could be better.",
              rating: 3,
              inv_id: inventoryResult.rows[0].inv_id,
              account_id:
                accountResult.rows.length > 1 ? accountResult.rows[1].account_id : accountResult.rows[0].account_id,
            },
          ]

          // Only add more reviews if we have more vehicles and accounts
          if (inventoryResult.rows.length > 1) {
            sampleReviews.push({
              text: "Excellent performance and fuel efficiency. Would definitely recommend to others!",
              rating: 4,
              inv_id: inventoryResult.rows[1].inv_id,
              account_id: accountResult.rows[0].account_id,
            })
          }

          if (inventoryResult.rows.length > 2 && accountResult.rows.length > 2) {
            sampleReviews.push({
              text: "I've had this vehicle for 3 months now and it's been very reliable. The only downside is the small trunk space.",
              rating: 4,
              inv_id: inventoryResult.rows[2].inv_id,
              account_id: accountResult.rows[2].account_id,
            })
          }

          if (inventoryResult.rows.length > 3 && accountResult.rows.length > 1) {
            sampleReviews.push({
              text: "Not impressed with the build quality. There are several rattles and the paint is already chipping after just a few months.",
              rating: 2,
              inv_id: inventoryResult.rows[3].inv_id,
              account_id: accountResult.rows[1].account_id,
            })
          }

          console.log(`📝 Creating ${sampleReviews.length} sample reviews...`)

          for (const review of sampleReviews) {
            try {
              await pool.query(
                `INSERT INTO review (review_text, review_rating, inv_id, account_id)
                 VALUES ($1, $2, $3, $4)`,
                [review.text, review.rating, review.inv_id, review.account_id],
              )
              console.log(`✅ Created review for vehicle ${review.inv_id} by account ${review.account_id}`)
            } catch (error) {
              console.error(`❌ Failed to create review: ${error.message}`)
            }
          }

          console.log("✅ Sample reviews creation completed")
        }
      }
    } else {
      console.log("✅ Sample reviews already exist")
    }

    // List all reviews
    console.log("\n📋 Current reviews in database:")
    const reviews = await pool.query(`
      SELECT r.review_id, r.review_rating, LEFT(r.review_text, 30) as review_excerpt,
             a.account_firstname, a.account_lastname,
             i.inv_make, i.inv_model
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      JOIN inventory i ON r.inv_id = i.inv_id
      ORDER BY r.review_date DESC
    `)

    reviews.rows.forEach((review) => {
      console.log(
        `   ${review.review_id}: ${review.review_rating}★ for ${review.inv_make} ${review.inv_model} by ${review.account_firstname} ${review.account_lastname} - "${review.review_excerpt}..."`,
      )
    })

    console.log("\n🎉 Reviews setup complete!")
  } catch (error) {
    console.error("❌ Error setting up reviews:", error)
  } finally {
    await pool.end()
  }
}

setupReviewsTable()
