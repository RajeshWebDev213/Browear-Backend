const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
