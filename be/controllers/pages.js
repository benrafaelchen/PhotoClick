const dbSingleton = require("../dbSingleton");

/**
 * Get About Us data
 */
const getAboutUsData = async (req, res) => {
  const query = `
    SELECT page_name, page_title, page_content, page_info
    FROM page_content
    WHERE page_name = ?
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, ["AboutUs"]);

    if (!results.length) {
      return res.status(404).send({ success: false });
    }

    res.send({
      success: true,
      data: results[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ success: false });
  }
};

/**
 * Update About Us content + contact info
 */
const editPageContent = async (req, res) => {
  const { page_content, page_info } = req.body;

  if (
    page_content === undefined ||
    page_content === null ||
    page_info === undefined ||
    page_info === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Both page_content and page_info are required to update the page.",
    });
  }

  const query = `
    UPDATE page_content
    SET page_content = ?, page_info = ?
    WHERE page_name = ?
  `;

  try {
    const result = await dbSingleton.promiseQuery(query, [
      page_content,
      page_info,
      "AboutUs",
    ]);

    res.send({
      success: result.affectedRows > 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ success: false });
  }
};

module.exports = {
  getAboutUsData,
  editPageContent,
};
