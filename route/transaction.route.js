const router = require("express").Router();

const {
  Insert,
  // generateQr
  // Register,
  // Login,
  // GetByPK,
  // whoami,
  // PictureUpdate,
} = require("../controller/transaction.controller");
const { Authenticate, restrictUser } = require("../middleware/restrict");

router.post("/", Authenticate, Insert);
// router.post("/qrcode", Authenticate, generateQr);



module.exports = router;