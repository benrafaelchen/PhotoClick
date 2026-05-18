// Events controller: returns the list of event names from the database.

const dbSingleton = require("../dbSingleton");

/**
 * Fetch all event names from `eventkind` table.
 * Returns: { success: true, data: [ "Wedding", "Birthday", ... ] }
 */
const getEventNames = async (req, res) => {
  const query = `SELECT EventName FROM eventkind`;

  try {
    const results = await dbSingleton.promiseQuery(query, []);

    const eventNames = results.map((row) => row.EventName);

    return res.status(200).send({
      success: true,
      data: eventNames,
    });
  } catch (error) {
    console.error("❌ Database query failed (getEventNames):", error);
    return res.status(500).send({ message: "Database error" });
  }
};

module.exports = {
  getEventNames,
};
