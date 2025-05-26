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

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL is not set in .env file")
  console.log("Please set up your DATABASE_URL in the .env file")
}

// View Engine and Templates
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views")) // Explicitly set views directory
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
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

// Routes
app.use(statics)
app.use("/inv", inventoryRoute)
app.use("/debug", debugRoute)

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
})
