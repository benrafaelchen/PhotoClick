const dbSingleton = require("../dbSingleton");
const path = require("path");
const fs = require("fs");

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8801}`;

const getImages = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery(
      "SELECT id, image_name, image_type, event_type FROM images"
    );

    const images = results.map((row) => ({
      id: row.id,
      name: row.image_name,
      type: row.image_type,
      eventType: row.event_type,
      src: `${API_BASE}/uploads/${row.image_name}`,
    }));

    res.status(200).json(images);
  } catch (err) {
    console.error("getImages error:", err.message);
    res.status(500).json({ message: "Error fetching images" });
  }
};

const addImages = (req, res) => {
  const files = req.files;
  const eventType = req.body.eventType;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const invalidFiles = files.filter((f) => !ALLOWED_TYPES.includes(f.mimetype));

  if (invalidFiles.length > 0) {
    invalidFiles.forEach((f) => {
      try { fs.unlinkSync(f.path); } catch (e) {}
    });
    return res.status(400).json({
      message: "Only JPEG, PNG, GIF, and WebP images are allowed",
    });
  }

  let inserted = 0;
  let errors = 0;

  files.forEach((file) => {
    const query = `
      INSERT INTO images (image_name, image_type, event_type, uploaded_at)
      VALUES (?, ?, ?, NOW())
    `;

    dbSingleton.query(query, [file.filename, file.mimetype, eventType || null], (err) => {
      if (err) {
        errors++;
        console.error("Error inserting image:", err.message);
      } else {
        inserted++;
      }

      if (inserted + errors === files.length) {
        res.status(200).json({
          message: `${inserted} image(s) uploaded successfully${errors > 0 ? `, ${errors} failed` : ""}`,
        });
      }
    });
  });
};

const deleteImage = async (req, res) => {
  const { imageId, imageName } = req.body;

  if (!imageId || !imageName) {
    return res.status(400).json({ message: "Missing imageId or imageName" });
  }

  const safeName = path.basename(imageName);
  const filePath = path.join(__dirname, "..", "routes", "public", "uploads", safeName);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await dbSingleton.promiseQuery("DELETE FROM images WHERE id = ?", [imageId]);
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("deleteImage error:", error.message);
    return res.status(500).json({ message: "Error deleting image" });
  }
};

module.exports = { getImages, addImages, deleteImage };
