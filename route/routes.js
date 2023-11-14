const router = require("express").Router();
const userRoute = require('../route/user.route')
const transactionRoute = require('../route/transaction.route')
const morgan = require("morgan");

router.use(morgan("dev"));
router.use('/user', userRoute)
router.use('/transaction', transactionRoute)

module.exports = router;
