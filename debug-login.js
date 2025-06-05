require("dotenv").config()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")

async function debugLogin() {
  console.log("🔍 Debugging login process...")

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    // Test 1: Check if we can find the test account
    console.log("\n📋 Test 1: Looking for test account...")
    const testEmail = "basic@example.com"
    const testPassword = "Pa$$w0rd"

    const accountResult = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [testEmail],
    )

    if (accountResult.rows.length === 0) {
      console.log(`❌ Account ${testEmail} not found in database`)
      return
    }

    const accountData = accountResult.rows[0]
    console.log(
      `✅ Found account: ${accountData.account_firstname} ${accountData.account_lastname} (${accountData.account_type})`,
    )

    // Test 2: Check password comparison
    console.log("\n🔒 Test 2: Testing password comparison...")
    const passwordMatch = await bcrypt.compare(testPassword, accountData.account_password)
    console.log(`Password match: ${passwordMatch}`)

    if (!passwordMatch) {
      console.log("❌ Password does not match")

      // Let's check what the stored password hash looks like
      console.log(`Stored hash: ${accountData.account_password}`)

      // Try creating a new hash and comparing
      const newHash = await bcrypt.hash(testPassword, 10)
      console.log(`New hash: ${newHash}`)
      const newMatch = await bcrypt.compare(testPassword, newHash)
      console.log(`New hash match: ${newMatch}`)

      return
    }

    // Test 3: Check JWT token creation
    console.log("\n🔑 Test 3: Testing JWT token creation...")

    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.log("❌ ACCESS_TOKEN_SECRET not set")
      return
    }

    // Remove password from account data before creating token
    delete accountData.account_password

    try {
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      console.log("✅ JWT token created successfully")
      console.log(`Token length: ${accessToken.length}`)

      // Test token verification
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
      console.log("✅ JWT token verified successfully")
      console.log(`Decoded payload:`, decoded)
    } catch (jwtError) {
      console.log(`❌ JWT error: ${jwtError.message}`)
    }

    // Test 4: Check environment variables
    console.log("\n🔐 Test 4: Checking environment variables...")
    const requiredEnvVars = ["DATABASE_URL", "SESSION_SECRET", "ACCESS_TOKEN_SECRET"]

    requiredEnvVars.forEach((envVar) => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`)
      } else {
        console.log(`❌ ${envVar}: Not set`)
      }
    })

    console.log("\n✅ Login debugging complete!")
  } catch (error) {
    console.error("❌ Debug error:", error)
  } finally {
    await pool.end()
  }
}

debugLogin()
