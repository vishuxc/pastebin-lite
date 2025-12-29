require("dotenv").config();
const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health.route");
const pasteRoute = require("./routes/paste.route");

const app = express();

const pastePageRoute = require("./routes/paste.page.route");
app.use("/p", pastePageRoute);


app.use(cors());
app.use(express.json());

app.use("/api/healthz", healthRoute);
app.use("/api/pastes", pasteRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
