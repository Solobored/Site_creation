const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/")

const validate = {}

/* **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // review_text is required and must be string
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review text must be between 10 and 1000 characters."),

    // review_rating is required and must be between 1 and 5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // inv_id is required and must be integer
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle ID."),
  ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, review_rating, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    // Get vehicle details for the form
    const invModel = require("../models/inventory-model")
    const vehicle = await invModel.getVehicleById(inv_id)

    res.render("reviews/add-review", {
      errors,
      title: `Review ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      review_text,
      review_rating,
    })
    return
  }
  next()
}

/* ******************************
 * Check edit data and return errors or continue
 * ***************************** */
validate.checkEditData = async (req, res, next) => {
  const { review_id, review_text, review_rating } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    // Get review details for the form
    const reviewModel = require("../models/review-model")
    const review = await reviewModel.getReviewById(review_id)

    res.render("reviews/edit-review", {
      errors,
      title: `Edit Review for ${review.inv_make} ${review.inv_model}`,
      nav,
      review: {
        ...review,
        review_text,
        review_rating,
      },
    })
    return
  }
  next()
}

module.exports = validate
