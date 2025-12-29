const express = require("express");
const db = require("../db");
const { getNow } = require("../utils/time");

const router = express.Router();

// Basic HTML escape (prevents XSS)
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    const [rows] = await db.query(
      "SELECT * FROM pastes WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send("<h1>404 Not Found</h1>");
    }

    const paste = rows[0];

    // TTL check
    if (paste.expires_at !== null && now >= paste.expires_at) {
      return res.status(404).send("<h1>404 Not Found</h1>");
    }

    // View limit check
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      return res.status(404).send("<h1>404 Not Found</h1>");
    }

    // Increment view count
    await db.query(
      "UPDATE pastes SET view_count = view_count + 1 WHERE id = ?",
      [id]
    );

    // Render safe HTML
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paste</title>
          <meta charset="UTF-8" />
        </head>
        <body>
          <pre>${escapeHtml(paste.content)}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h1>Server Error</h1>");
  }
});

module.exports = router;
