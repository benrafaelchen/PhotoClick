// Controller for checking available photographers (stills & video) for a given event date.
// This file does NOT modify the existing logic — only adds clean English comments.

const dbSingleton = require("../dbSingleton");

/**
 * Returns how many photographers are available on a specific event date.
 *
 * RoleID 3 = Stills Photographer
 * RoleID 4 = Video Photographer
 *
 * The query:
 * - Counts all photographers in the system (per role)
 * - Subtracts photographers already assigned to another event on the same date
 */
const getPhotographerLimits = (req, res) => {
  const { eventDate } = req.query; // Selected date from frontend (optional)

  const query = `
    SELECT 
      RoleID,
      CASE 
        WHEN RoleID = 3 THEN 'Photographer-Stills'
        WHEN RoleID = 4 THEN 'Photographer-Video'
      END AS RoleName,

      -- Total photographers of this role minus the ones already assigned on that date
      COUNT(*) - IFNULL((
        SELECT COUNT(*) 
        FROM orders o 
        JOIN orders_workers op ON o.OrderNumber = op.OrderNumber 
        WHERE o.DateOfEvent = ? AND op.Personal_id = users.Personal_id
      ), 0) AS available

    FROM users
    WHERE RoleID IN (3, 4)
    GROUP BY RoleID;
  `;

  dbSingleton.query(query, [eventDate], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch photographer limits:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    console.log("📸 Photographer limits result:", results);

    return res.status(200).json({
      success: true,
      data: results,
    });
  });
};

module.exports = { getPhotographerLimits };
