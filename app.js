const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect db
require("./config/db");

app.use((err, req, res, next) => {
  res.status = err.status || 500;
  if (req.app.get("env") === "development") {
    res.json({
      message: err.message,
      error: err,
    });
  } else {
    res.json({
      message: err.message,
      error: {},
    });
  }
});
app.listen(3000, () => console.log("listening on port 3000"));
