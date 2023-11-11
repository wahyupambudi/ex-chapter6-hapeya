const router = require("express").Router();

const { Register, Login, whoami } = require("../controller/user.controller");
const { Authenticate } = require("../middleware/restrict");
// const { CheckPostUser } = require('../middleware/middleware')


router.post("/register", Register);
router.post("/login", Login);
router.get("/whoami", Authenticate, whoami);


module.exports = router;
