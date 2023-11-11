const router = require("express").Router();
const userRoute = require('../route/user.route')

router.use('/user', userRoute)

module.exports = router;
