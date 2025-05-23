const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async (req, res, next) => {
  try {
    const data = await invModel.getClassifications()
    let list = "<ul id='nav-items'>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += "<li>"
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
      list += "</li>"
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Util.getNav error:", error)
    let list = "<ul id='nav-items'>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    list += '<li><a href="/inv/type/1" title="Custom vehicles">Custom</a></li>'
    list += '<li><a href="/inv/type/5" title="Sedan vehicles">Sedan</a></li>'
    list += '<li><a href="/inv/type/2" title="Sport vehicles">Sport</a></li>'
    list += '<li><a href="/inv/type/3" title="SUV vehicles">SUV</a></li>'
    list += '<li><a href="/inv/type/4" title="Truck vehicles">Truck</a></li>'
    list += "</ul>"
    return list
  }
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async (data) => {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<h2>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid += "<span>$" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetail = async (vehicle) => {
  let detail = '<div class="vehicle-detail">'

  // Vehicle image and info container
  detail += '<div class="vehicle-detail-container">'

  // Vehicle image
  detail += '<div class="vehicle-image">'
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`
  detail += "</div>"

  // Vehicle information
  detail += '<div class="vehicle-info">'
  detail += `<h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`
  detail += '<div class="vehicle-price">'
  detail += `<span class="price-label">Price: </span>`
  detail += `<span class="price-value">$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`
  detail += "</div>"

  // Vehicle specifications
  detail += '<div class="vehicle-specs">'
  detail += "<ul>"
  detail += `<li><span>Year:</span> ${vehicle.inv_year}</li>`
  detail += `<li><span>Make:</span> ${vehicle.inv_make}</li>`
  detail += `<li><span>Model:</span> ${vehicle.inv_model}</li>`
  detail += `<li><span>Mileage:</span> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)}</li>`
  detail += `<li><span>Color:</span> ${vehicle.inv_color}</li>`
  detail += `<li><span>Classification:</span> ${vehicle.classification_name}</li>`
  detail += "</ul>"
  detail += "</div>"

  // Vehicle description
  detail += '<div class="vehicle-description">'
  detail += `<p>${vehicle.inv_description}</p>`
  detail += "</div>"

  // Call to action
  detail += '<div class="vehicle-cta">'
  detail += '<button class="own-today-btn">Contact Us About This Vehicle</button>'
  detail += "</div>"

  detail += "</div>" // Close vehicle-info
  detail += "</div>" // Close vehicle-detail-container
  detail += "</div>" // Close vehicle-detail

  return detail
}

module.exports = Util
