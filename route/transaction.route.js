const router = require("express").Router();

const {
  Insert,
  // generateQr
  // Register,
  // Login,
  GetByPK,
  // whoami,
  // PictureUpdate,
} = require("../controller/transaction.controller");
const { Authenticate, restrictUser, restrictUserTrx, restrictGetUser } = require("../middleware/restrict");

router.post("/:id", Authenticate, restrictUserTrx, Insert);
router.get('/:userId', Authenticate, restrictGetUser, GetByPK)
// router.post("/qrcode", Authenticate, generateQr);



module.exports = router;