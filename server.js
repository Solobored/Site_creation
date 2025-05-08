// Require statements
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const statics = require("./routes/static")
const app = express()
const port = process.env.PORT || 5500
console.log(`Environment PORT: ${process.env.PORT}`)

// View Engine and Templates
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Routes
app.use(statics)

// Index route
app.get("/", (req, res) => {
  res.render("index", { title: "Home" })
})

// 404 Error Handler
app.use((req, res) => {
  res.status(404).render("errors/404", { title: "404 - Page Not Found" })
})

// Server Listener
app.listen(port, () => {
  console.log(`CSE Motors running on port ${port}`)
})
