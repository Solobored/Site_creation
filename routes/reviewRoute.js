const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../middleware/review-validation")

// Route to view all reviews for a specific vehicle
router.get("/vehicle/:inventoryId", utilities.handleErrors(reviewController.buildVehicleReviews))

// Route to add a review (requires login)
router.get(
  "/add/:inventoryId",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildAddReview),
)

// Process the add review form
router.post(
  "/add",
  utilities.checkJWTToken,
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview),
)

// Route to edit a review (requires login)
router.get(
  "/edit/:reviewId",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview),
)

// Process the edit review form
router.post(
  "/edit",
  utilities.checkJWTToken,
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkEditData,
  utilities.handleErrors(reviewController.updateReview),
)

// Process delete review
router.get(
  "/delete/:reviewId",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview),
)

// Route to view all reviews by the logged-in user
router.get(
  "/user",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildUserReviews),
)

module.exports = router
