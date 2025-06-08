const pool = require("../database/")

/* ***************************
 *  Get all reviews by inventory ID
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT r.*, a.account_firstname, a.account_lastname 
       FROM public.review AS r 
       JOIN public.account AS a ON r.account_id = a.account_id 
       WHERE r.inv_id = $1
       ORDER BY r.review_date DESC`,
      [inv_id],
    )
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    throw error
  }
}

/* ***************************
 *  Get all reviews by account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT r.*, i.inv_make, i.inv_model, i.inv_year 
       FROM public.review AS r 
       JOIN public.inventory AS i ON r.inv_id = i.inv_id 
       WHERE r.account_id = $1
       ORDER BY r.review_date DESC`,
      [account_id],
    )
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    throw error
  }
}

/* ***************************
 *  Get review by review ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const data = await pool.query(
      `SELECT r.*, i.inv_make, i.inv_model, i.inv_year 
       FROM public.review AS r 
       JOIN public.inventory AS i ON r.inv_id = i.inv_id 
       WHERE r.review_id = $1`,
      [review_id],
    )
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    throw error
  }
}

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(review_text, review_rating, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO public.review (review_text, review_rating, inv_id, account_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *`

    const data = await pool.query(sql, [review_text, review_rating, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql = `
      UPDATE public.review
      SET review_text = $1, review_rating = $2, review_date = CURRENT_TIMESTAMP
      WHERE review_id = $3
      RETURNING *`

    const data = await pool.query(sql, [review_text, review_rating, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM public.review WHERE review_id = $1 RETURNING *`
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("deleteReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Check if user has already reviewed a vehicle
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
  try {
    const sql = `SELECT * FROM public.review WHERE inv_id = $1 AND account_id = $2`
    const data = await pool.query(sql, [inv_id, account_id])
    return data.rowCount > 0 ? data.rows[0] : null
  } catch (error) {
    console.error("checkExistingReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Get average rating for a vehicle
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `
      SELECT ROUND(AVG(review_rating), 1) as average_rating, 
             COUNT(*) as review_count 
      FROM public.review 
      WHERE inv_id = $1`

    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    throw error
  }
}

module.exports = {
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
  checkExistingReview,
  getAverageRating,
}
