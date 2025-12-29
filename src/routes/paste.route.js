const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { getNow } = require("../utils/time");

const router = express.Router(); // ✅ THIS WAS MISSING

/**
 * POST /api/pastes
 * Create a new paste
 */
router.post("/", async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "content is required" });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res.status(400).json({ error: "ttl_seconds must be >= 1" });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res.status(400).json({ error: "max_views must be >= 1" });
    }

    const id = uuidv4();
    const now = getNow(req);
    const expires_at =
      ttl_seconds !== undefined ? now + ttl_seconds * 1000 : null;

    await db.query(
      `INSERT INTO pastes
       (id, content, created_at, expires_at, max_views, view_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, content, now, expires_at, max_views ?? null, 0]
    );

    res.status(201).json({
      id,
      url: `${req.protocol}://${req.get("host")}/p/${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/**
 * GET /api/pastes/:id
 * Fetch a paste (API)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    const [rows] = await db.query(
      "SELECT * FROM pastes WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "paste not found" });
    }

    const paste = rows[0];

    if (paste.expires_at !== null && now >= paste.expires_at) {
      return res.status(404).json({ error: "paste expired" });
    }

    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      return res.status(404).json({ error: "view limit exceeded" });
    }

    await db.query(
      "UPDATE pastes SET view_count = view_count + 1 WHERE id = ?",
      [id]
    );

    const remaining_views =
      paste.max_views !== null
        ? paste.max_views - (paste.view_count + 1)
        : null;

    res.json({
      content: paste.content,
      remaining_views,
      expires_at: paste.expires_at
        ? new Date(paste.expires_at).toISOString()
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router; // ✅ REQUIRED
