let {Router} = require('express')
let router = new Router()
let cookieParser = require('cookie-parser')
router.use(cookieParser())


//import controllers
let ratecontroller = require('../controllers/ratecontroller');

router.post('/allfiles/:this_filename',ratecontroller.rateFileController);


module.exports = router