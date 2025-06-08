const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")

/* ***************************
 *  Build reviews view for a specific vehicle
 * ************************** */
async function buildVehicleReviews(req, res, next) {
  try {
    const inv_id = Number.parseInt(req.params.inventoryId)
    if (isNaN(inv_id)) {
      req.flash("notice", "Invalid vehicle ID")
      return res.redirect("/")
    }

    // Get vehicle details
    const vehicle = await invModel.getVehicleById(inv_id)
    if (!vehicle) {
      req.flash("notice", "Vehicle not found")
      return res.redirect("/")
    }

    // Get reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)

    // Get average rating
    const ratingData = await reviewModel.getAverageRating(inv_id)

    // Check if logged-in user has already reviewed this vehicle
    let userReview = null
    if (res.locals.accountData) {
      userReview = await reviewModel.checkExistingReview(inv_id, res.locals.accountData.account_id)
    }

    const nav = await utilities.getNav()
    const title = `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("reviews/vehicle-reviews", {
      title,
      nav,
      vehicle,
      reviews,
      ratingData,
      userReview,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add review view
 * ************************** */
async function buildAddReview(req, res, next) {
  try {
    const inv_id = Number.parseInt(req.params.inventoryId)
    if (isNaN(inv_id)) {
      req.flash("notice", "Invalid vehicle ID")
      return res.redirect("/")
    }

    // Get vehicle details
    const vehicle = await invModel.getVehicleById(inv_id)
    if (!vehicle) {
      req.flash("notice", "Vehicle not found")
      return res.redirect("/")
    }

    // Check if user has already reviewed this vehicle
    if (res.locals.accountData) {
      const existingReview = await reviewModel.checkExistingReview(inv_id, res.locals.accountData.account_id)
      if (existingReview) {
        req.flash("notice", "You have already reviewed this vehicle. You can edit your existing review.")
        return res.redirect(`/reviews/edit/${existingReview.review_id}`)
      }
    }

    const nav = await utilities.getNav()
    const title = `Review ${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("reviews/add-review", {
      title,
      nav,
      vehicle,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add review
 * ************************** */
async function addReview(req, res, next) {
  try {
    const { review_text, review_rating, inv_id } = req.body
    const account_id = res.locals.accountData.account_id

    // Check if user has already reviewed this vehicle
    const existingReview = await reviewModel.checkExistingReview(inv_id, account_id)
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle")
      return res.redirect(`/reviews/vehicle/${inv_id}`)
    }

    // Add the review
    const result = await reviewModel.addReview(review_text, review_rating, inv_id, account_id)

    if (result) {
      req.flash("notice", "Review added successfully")
      res.redirect(`/reviews/vehicle/${inv_id}`)
    } else {
      req.flash("notice", "Failed to add review")
      res.status(501).redirect(`/reviews/add/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit review view
 * ************************** */
async function buildEditReview(req, res, next) {
  try {
    const review_id = Number.parseInt(req.params.reviewId)
    if (isNaN(review_id)) {
      req.flash("notice", "Invalid review ID")
      return res.redirect("/account/")
    }

    // Get review details
    const review = await reviewModel.getReviewById(review_id)
    if (!review) {
      req.flash("notice", "Review not found")
      return res.redirect("/account/")
    }

    // Check if the review belongs to the logged-in user
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only edit your own reviews")
      return res.redirect("/account/")
    }

    const nav = await utilities.getNav()
    const title = `Edit Review for ${review.inv_make} ${review.inv_model}`

    res.render("reviews/edit-review", {
      title,
      nav,
      review,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process edit review
 * ************************** */
async function updateReview(req, res, next) {
  try {
    const { review_id, review_text, review_rating, inv_id } = req.body

    // Get the review to check ownership
    const review = await reviewModel.getReviewById(review_id)
    if (!review) {
      req.flash("notice", "Review not found")
      return res.redirect("/account/")
    }

    // Check if the review belongs to the logged-in user
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only edit your own reviews")
      return res.redirect("/account/")
    }

    // Update the review
    const result = await reviewModel.updateReview(review_id, review_text, review_rating)

    if (result) {
      req.flash("notice", "Review updated successfully")
      res.redirect(`/reviews/vehicle/${inv_id}`)
    } else {
      req.flash("notice", "Failed to update review")
      res.status(501).redirect(`/reviews/edit/${review_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process delete review
 * ************************** */
async function deleteReview(req, res, next) {
  try {
    const review_id = Number.parseInt(req.params.reviewId)
    if (isNaN(review_id)) {
      req.flash("notice", "Invalid review ID")
      return res.redirect("/account/")
    }

    // Get the review to check ownership and get inv_id
    const review = await reviewModel.getReviewById(review_id)
    if (!review) {
      req.flash("notice", "Review not found")
      return res.redirect("/account/")
    }

    // Check if the review belongs to the logged-in user
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only delete your own reviews")
      return res.redirect("/account/")
    }

    // Delete the review
    const result = await reviewModel.deleteReview(review_id)

    if (result) {
      req.flash("notice", "Review deleted successfully")
      res.redirect(`/reviews/vehicle/${review.inv_id}`)
    } else {
      req.flash("notice", "Failed to delete review")
      res.status(501).redirect(`/reviews/vehicle/${review.inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build user reviews view
 * ************************** */
async function buildUserReviews(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id

    // Get all reviews by this user
    const reviews = await reviewModel.getReviewsByAccountId(account_id)

    const nav = await utilities.getNav()
    const title = "My Reviews"

    res.render("reviews/user-reviews", {
      title,
      nav,
      reviews,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildVehicleReviews,
  buildAddReview,
  addReview,
  buildEditReview,
  updateReview,
  deleteReview,
  buildUserReviews,
}
