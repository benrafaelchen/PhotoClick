const dbSingleton = require("../dbSingleton");

/**
 * Get all FAQ items from the database.
 * Returns: { success: true, data: [ { faq_id, faq_title, faq_content }, ... ] }
 */
const getFAQData = async (req, res) => {
  const faqQuery = `
    SELECT faq_id, faq_title, faq_content
    FROM faq
    ORDER BY created_at ASC
  `;

  try {
    const results = await dbSingleton.promiseQuery(faqQuery, []);

    const formattedResults = results.map((row) => ({
      faq_id: row.faq_id,
      faq_title: row.faq_title,
      faq_content: row.faq_content,
    }));

    console.log("📄 FAQ rows:", formattedResults);

    return res.status(200).send({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error("❌ Database query failed (getFAQData):", error);
    return res.status(500).json({
      success: false,
      message: "We could not load the FAQ list. Please try again later.",
    });
  }
};

/**
 * Add a new FAQ item.
 * Expects: req.body.data = { faq_title, faq_content }
 * Returns: { success: true, faq_id: <insertId> }
 */
const addFaqData = async (req, res) => {
  console.log(">> POST /addFaq body:", req.body);

  if (!req.body || !req.body.data) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body. Please send FAQ data in the expected format.",
    });
  }

  const { faq_title, faq_content } = req.body.data;

  if (!faq_title || !faq_content) {
    return res.status(400).json({
      success: false,
      message: "Each FAQ needs both a title and content.",
    });
  }

  const faqQuery = "INSERT INTO faq (faq_title, faq_content) VALUES (?, ?)";

  try {
    const results = await dbSingleton.promiseQuery(faqQuery, [
      faq_title,
      faq_content,
    ]);

    console.log("✅ New FAQ inserted, id:", results.insertId);

    return res.status(200).json({
      success: true,
      faq_id: results.insertId,
    });
  } catch (error) {
    console.error("❌ Database query failed (addFaqData):", error);
    return res.status(500).json({
      success: false,
      message: "We could not save this FAQ. Please try again later.",
    });
  }
};

/**
 * Delete an FAQ item by id.
 * Expects: req.body.data = <faq_id>
 * Returns: { success: true }
 */
const deleteFaqData = async (req, res) => {
  console.log(">> DELETE /deleteFaq body:", req.body);

  const rawId = req.body?.data;
  if (typeof rawId !== "number" || !Number.isInteger(rawId) || rawId < 1) {
    return res.status(400).json({
      success: false,
      message: "FAQ ID must be a positive whole number.",
    });
  }

  const id = rawId;
  console.log(">> DELETE /deleteFaq id:", id);

  const faqQuery = `DELETE FROM faq WHERE faq_id = ?`;

  try {
    await dbSingleton.promiseQuery(faqQuery, [id]);
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    console.error("❌ Database query failed (deleteFaqData):", error);
    return res.status(500).json({
      success: false,
      message: "We could not delete this FAQ. Please try again later.",
    });
  }
};

module.exports = {
  getFAQData,
  addFaqData,
  deleteFaqData,
};
