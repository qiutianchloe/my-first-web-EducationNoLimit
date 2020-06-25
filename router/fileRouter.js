let {Router} = require('express')
let router = new Router()
let cookieParser = require('cookie-parser')
router.use(cookieParser())

let fs= require('fs');

//import controllers
let filecontroller = require('../controllers/filecontroller');
let ratecontroller = require('../controllers/ratecontroller');

router.get('/upload',filecontroller.checkValidBeforeUpload);

router.post('/upload', filecontroller.uploadStrategy, filecontroller.uploadFileController);

router.get('/allfiles', filecontroller.listAllFileController);

router.post('/allfiles',filecontroller.filterResultController);

router.get('/allfiles/:this_filename',filecontroller.fileInfoController);

router.post('/allfiles/:this_filename',ratecontroller.rateFileController);

router.get("/allfiles/downloadfile/:filename",filecontroller.downloadfileController);

module.exports = router