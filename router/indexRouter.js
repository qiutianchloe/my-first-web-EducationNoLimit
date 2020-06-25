/*
* UI router
* */

let {Router} = require('express')
let router = new Router()
let cookieParser = require('cookie-parser')
router.use(cookieParser())

//import controllers
let usercontroller = require('../controllers/usercontroller');

//Ui router--homePage
router.get('/homePage',(request,response)=>{
    response.render('homePage')
})

//root router
router.get('/', usercontroller.rootController);

module.exports = router