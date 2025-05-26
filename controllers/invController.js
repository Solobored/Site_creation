const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async (req, res, next) => {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  if (!data || data.length === 0) {
    const err = new Error("No vehicles found for this classification")
    err.status = 404
    return next(err)
  }

  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
})

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = utilities.handleErrors(async (req, res, next) => {
  const inventory_id = req.params.inventoryId
  const vehicle = await invModel.getVehicleById(inventory_id)

  if (!vehicle) {
    const err = new Error("Vehicle not found")
    err.status = 404
    return next(err)
  }

  const vehicleHtml = await utilities.buildVehicleDetail(vehicle)
  const nav = await utilities.getNav()
  const title = `${vehicle.inv_make} ${vehicle.inv_model}`

  res.render("inventory/detail", {
    title,
    nav,
    vehicleHtml,
  })
})

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
  })
})

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
})

/* ***************************
 *  Process Add classification
 * ************************** */
invCont.addClassification = utilities.handleErrors(async (req, res) => {
  const { classification_name } = req.body

  // Check if classification already exists
  const classExists = await invModel.checkExistingClassification(classification_name)
  if (classExists) {
    req.flash("notice", "Sorry, that classification name already exists.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors: null,
      classification_name,
    })
    return
  }

  const classResult = await invModel.addClassification(classification_name)

  if (classResult) {
    req.flash("notice", `The ${classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: await utilities.getNav(),
    })
  } else {
    req.flash("notice", "Sorry, the classification failed to be added.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors: null,
      classification_name,
    })
  }
})

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
  })
})

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const invResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  )

  if (invResult) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle failed to be added.")
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
})

module.exports = invCont
