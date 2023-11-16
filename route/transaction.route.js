const router = require("express").Router();

const {
  Insert,
  Update,
  // Register,
  // Login,
  GetByPK,
  // whoami,
  Delete,
} = require("../controller/transaction.controller");
const { Authenticate, restrictUser, restrictUserTrx, restrictGetUser } = require("../middleware/restrict");

const storage = require("../lib/multer");
const multer = require("multer")();


// router.post("/:id", multer.single("qr_png"), Authenticate, restrictUserTrx, Insert);
router.post("/:id",  Authenticate, restrictUserTrx, Insert);
router.get('/:userId', Authenticate, restrictGetUser, GetByPK)
router.delete('/:id', Authenticate, restrictUserTrx, Delete)
router.put('/:id', Authenticate, restrictUserTrx, Update)
// router.post("/qrcode", Authenticate, generateQr);



module.exports = router;