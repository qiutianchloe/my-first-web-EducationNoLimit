/*
* user router
* */

let {Router} = require('express')
let router = new Router()
let cookieParser = require('cookie-parser')
router.use(cookieParser())



//import controllers
let usercontroller = require('../controllers/usercontroller');

//UI router--register
router.get('/register',(request,response)=>{
    response.render('register',{errMsg:{}})
})
//UI router--login
router.get('/login',(request,response)=>{
    const {email} = request.query
    response.render('login',{errMsg:{email}})
})
//UI router--userCenter
router.get('/userCenter',usercontroller.userCenterController);
//register router
router.post('/register', usercontroller.registerController);

//login router
router.post('/login', usercontroller.loginController);

//logout router
router.post('/logout',usercontroller.logoutController);

module.exports = router