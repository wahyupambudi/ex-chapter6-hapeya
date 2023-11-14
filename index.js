require("dotenv").config();

const express = require("express");
const app = express();
const router = require("./route/routes");
// const fileUpload = require('express-fileupload');


const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());

app.use("/images", express.static("media/images"));
app.use("/", router);

app.listen(port, () => {
  console.log(`service running on port ${port}`)
})