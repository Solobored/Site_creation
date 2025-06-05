require("dotenv").config()
const { Pool } = require("pg")
const bcrypt = require("bcryptjs")

async function fixAccountPasswords() {
  console.log("🔧 Fixing account passwords...")

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

    // Create the correct password hash
    const correctPassword = "Pa$$w0rd"
    const hashedPassword = await bcrypt.hash(correctPassword, 10)
    console.log("🔒 Created new password hash")

    // Update existing accounts
    console.log("\n📝 Updating account passwords...")

    // Update Basic User
    const basicResult = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_email = $2 RETURNING account_firstname, account_lastname",
      [hashedPassword, "basic@example.com"],
    )

    if (basicResult.rows.length > 0) {
      console.log(
        `✅ Updated password for: ${basicResult.rows[0].account_firstname} ${basicResult.rows[0].account_lastname}`,
      )
    }

    // Update Happy Employee
    const employeeResult = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_email = $2 RETURNING account_firstname, account_lastname",
      [hashedPassword, "happy@example.com"],
    )

    if (employeeResult.rows.length > 0) {
      console.log(
        `✅ Updated password for: ${employeeResult.rows[0].account_firstname} ${employeeResult.rows[0].account_lastname}`,
      )
    }

    // Check if Admin account exists, if not create it
    const adminCheck = await pool.query("SELECT * FROM account WHERE account_email = $1", ["admin@example.com"])

    if (adminCheck.rows.length === 0) {
      console.log("📝 Creating Admin account...")
      await pool.query(
        "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5)",
        ["Admin", "User", "admin@example.com", hashedPassword, "Admin"],
      )
      console.log("✅ Created Admin account")
    } else {
      // Update existing admin account
      const adminResult = await pool.query(
        "UPDATE account SET account_password = $1 WHERE account_email = $2 RETURNING account_firstname, account_lastname",
        [hashedPassword, "admin@example.com"],
      )
      if (adminResult.rows.length > 0) {
        console.log(
          `✅ Updated password for: ${adminResult.rows[0].account_firstname} ${adminResult.rows[0].account_lastname}`,
        )
      }
    }

    // Test the password with one account
    console.log("\n🧪 Testing password verification...")
    const testAccount = await pool.query("SELECT account_password FROM account WHERE account_email = $1", [
      "basic@example.com",
    ])

    if (testAccount.rows.length > 0) {
      const passwordMatch = await bcrypt.compare(correctPassword, testAccount.rows[0].account_password)
      console.log(`Password verification test: ${passwordMatch ? "✅ SUCCESS" : "❌ FAILED"}`)
    }

    // List all accounts
    console.log("\n📋 Current accounts:")
    const accounts = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_id",
    )

    accounts.rows.forEach((acc) => {
      console.log(
        `   ${acc.account_id}: ${acc.account_firstname} ${acc.account_lastname} (${acc.account_email}) - ${acc.account_type}`,
      )
    })

    console.log("\n🎉 Password fix complete!")
    console.log("\n🔑 Test accounts (all with password 'Pa$$w0rd'):")
    console.log("   Client: basic@example.com / Pa$$w0rd")
    console.log("   Employee: happy@example.com / Pa$$w0rd")
    console.log("   Admin: admin@example.com / Pa$$w0rd")
  } catch (error) {
    console.error("❌ Error fixing passwords:", error)
  } finally {
    await pool.end()
  }
}

fixAccountPasswords()
