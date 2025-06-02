// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validate = require("../middleware/validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleDetail))

// Route to build inventory management view
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement),
)

// Route to build add classification view
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification),
)

// Process the add classification attempt
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification),
)

// Route to build add inventory view
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory),
)

// Process the add inventory attempt
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory),
)

module.exports = router
