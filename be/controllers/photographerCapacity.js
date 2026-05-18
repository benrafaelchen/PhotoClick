// Photographer capacity controller: returns how many stills/video photographers exist in the system.

const dbSingleton = require("../dbSingleton");

/**
 * Get how many stills/video photographers exist in the system.
 * RoleID 3 = Stills photographer
 * RoleID 4 = Video photographer
 */
const getPhotographerCaps = async (req, res) => {
  const query = `
    SELECT RoleID, COUNT(*) AS count
    FROM users
    WHERE RoleID IN (3, 4)
    GROUP BY RoleID
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, []);

    let maxStills = 0;
    let maxVideo = 0;

    results.forEach((row) => {
      if (row.RoleID === 3) maxStills = row.count;
      if (row.RoleID === 4) maxVideo = row.count;
    });

    return res.status(200).json({
      success: true,
      caps: { maxStills, maxVideo },
    });
  } catch (err) {
    console.error("Caps query failed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Database error" });
  }
};

module.exports = {
  // Main export
  getPhotographerCaps,

  // Backwards compatibility: old name used in routes (getPhotographerLimits)
  getPhotographerLimits: getPhotographerCaps,
};
