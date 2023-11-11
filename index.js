require("dotenv").config();

const express = require("express");
const app = express();
const router = require("./route/routes");

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(port, () => {
  console.log(`service running on port ${port}`)
})