const router = require("express").Router();

const {
  Register,
  Login,
  // Get,
  whoami,
  PictureUpdate,
} = require("../controller/user.controller");
const { Authenticate, restrictUser } = require("../middleware/restrict");
// const { CheckPostUser } = require('../middleware/middleware')

const storage = require("../lib/multer");
const multer = require("multer")();

router.post("/register", Register);
router.post("/login", Login);
router.get("/whoami", Authenticate, whoami);
// router.get("/", Authenticate, Get);
router.put(
  "/:email",
  Authenticate,
  restrictUser,
  storage.Image.single("profilePicture"),
  PictureUpdate,
);
// router.post("/image-single", storage.Image.single("images"), MediaProcessingImage);

module.exports = router;
