// Require statements
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
const statics = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const debugRoute = require("./routes/debugRoute")
const utilities = require("./utilities")
const app = express()
require("dotenv").config()
const port = process.env.PORT || 5500
console.log(`Environment PORT: ${process.env.PORT || 5500}`)

// Add this import near the top with other requires
const cookieParser = require("cookie-parser")
const accountRoute = require("./routes/accountRoute")
const reviewRoute = require("./routes/reviewRoute") // Added import

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL is not set in .env file")
  console.log("Please set up your DATABASE_URL in the .env file")
}

// Check and generate fallback environment variables for development
const requiredEnvVars = {
  SESSION_SECRET: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "dev-access-token-secret-change-in-production",
}

// Warn about missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    console.error(`❌ WARNING: ${key} is not set in environment variables`)
    if (process.env.NODE_ENV === "production") {
      console.error(`🚨 CRITICAL: ${key} must be set in production!`)
    } else {
      console.log(`🔧 Using fallback value for ${key} in development`)
      process.env[key] = value
    }
  } else {
    console.log(`✅ ${key} is configured`)
  }
})

// Exit if critical environment variables are missing in production
if (process.env.NODE_ENV === "production") {
  const missingVars = ["SESSION_SECRET", "ACCESS_TOKEN_SECRET"].filter((key) => !process.env[key])
  if (missingVars.length > 0) {
    console.error("🚨 CRITICAL ERROR: Missing required environment variables in production:")
    missingVars.forEach((key) => console.error(`   - ${key}`))
    console.error("Please set these variables in your Render.com environment settings")
    process.exit(1)
  }
}

// View Engine and Templates
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views")) // Explicitly set views directory
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Session middleware with better production settings
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
)

// Flash message middleware
app.use(flash())

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Add cookie parser middleware after session middleware
app.use(cookieParser())

// Add JWT token check middleware
app.use(require("./utilities").checkJWTToken)

// Add request logging for debugging (only in development or when needed)
if (process.env.NODE_ENV !== "production" || process.env.DEBUG_REQUESTS === "true") {
  app.use((req, res, next) => {
    if (req.path.includes("/account/")) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
      if (req.method === "POST") {
        console.log("POST data:", { ...req.body, account_password: req.body.account_password ? "[HIDDEN]" : undefined })
      }
    }
    next()
  })
}

// Routes
app.use(statics)
app.use("/inv", inventoryRoute)
// Add account routes after inventory routes
app.use("/account", accountRoute)
app.use("/reviews", reviewRoute) // Added route
app.use("/debug", debugRoute)

// Environment check route (for debugging)
app.get("/env-check", (req, res) => {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
    SESSION_SECRET: process.env.SESSION_SECRET ? "Set" : "Not set",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ? "Set" : "Not set",
    PORT: process.env.PORT || "5500 (default)",
  }

  res.json(envStatus)
})

// Index route
app.get("/", async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("index", {
      title: "Home",
      nav,
    })
  } catch (error) {
    console.error("Error in index route:", error)
    // Fallback to render the page even if nav fails
    res.render("index", {
      title: "Home",
      nav: "<ul id='nav-items'><li><a href='/'>Home</a></li></ul>",
    })
  }
})

// Database connection status route
app.get("/db-status", async (req, res) => {
  try {
    const pool = require("./database/")
    const result = await pool.query("SELECT NOW() as time")
    res.json({
      status: "connected",
      time: result.rows[0].time,
      message: "Database connection successful",
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    })
  }
})

// Intentional error route
app.get("/trigger-error", (req, res, next) => {
  // Create a new error and pass it to the next middleware
  const err = new Error("This is an intentional error")
  err.status = 500
  next(err)
})

// 404 Error Handler - Must be after all other routes
app.use(async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.status(404).render("errors/404", {
      title: "404 - Page Not Found",
      nav,
    })
  } catch (error) {
    console.error("Error in 404 handler:", error)
    res.status(404).render("errors/404", {
      title: "404 - Page Not Found",
      nav: "<ul id='nav-items'><li><a href='/'>Home</a></li></ul>",
    })
  }
})

// 500 Error Handler
app.use(async (err, req, res, next) => {
  console.error("Server Error:", err.stack)
  try {
    const nav = await utilities.getNav()
    res.status(err.status || 500).render("errors/500", {
      title: "Server Error",
      nav,
      error: err,
    })
  } catch (error) {
    console.error("Error in 500 handler:", error)
    res.status(500).render("errors/500", {
      title: "Server Error",
      nav: "<ul id='nav-items'><li><a href='/'>Home</a></li></ul>",
      error: err,
    })
  }
})

// Server Listener
app.listen(port, () => {
  console.log(`CSE Motors running on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
