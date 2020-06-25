//import user model
let userModel = require('../database/model/userModel')
let fileModel = require('../database/model/fileModel');
//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const rootController = (request,response)=>{
    response.redirect('/homePage')
}

const registerController = async(request,response)=>{
    //get user input
    const {email,username,age,info,password,re_password} = request.body

    //define Regex
    const emailReg = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/
    const userNameReg = /^[a-zA-Z0-9_-]{2,16}$/
    const ageReg = /^(?:[1-9][0-9]?|1[01][0-9]|120)$/
    const passwordReg = /^[a-zA-Z0-9~!@&%#_]{6,16}$/

    //validate input by using Regex
    //define a object to collect error information
    let errMsg = {}
    if(!emailReg.test(email)){
        errMsg.emailErr = "Email is not valid."
    }
    if(!userNameReg.test(username)){
        errMsg.usernameErr = "Username is not valid. The length should be in 2-26 and shouldn't include special character."
    }
    if(!ageReg.test(age)){
        errMsg.ageErr = "age is not valid. Age should be 1 to 120 year old."
    }
    if(!passwordReg.test(password)){
        errMsg.passwordErr = "Password is not valid. The length should be in 6 to 16 characters."
    }
    if(password !== re_password){
        errMsg.repasswordErr = "Make sure you enter the same password."
    }
    //check if the errMsg is null
    if(JSON.stringify(errMsg) !== '{}'){
        //if the errMsg is null means that some of the user input is not valid
        response.render('register',{errMsg})
        return
    }

    //check if the email has been registered
    //in case the server side or database may collapse, try to catch the error information
    try{
        //try to find the email from the user database
        let findResult = await userModel.findOne({email: email})

        //generate the bcrypt password in order to store at the database safely
        let hashedPassword = bcrypt.hashSync(password, saltRounds);

        if (findResult) {
            //if we find that email, ask the user to write the information again 
            errMsg.emailErr = `Register failure! ${email} has been registered.`
            response.render('register',{errMsg})
        } else {
            //if we didn't find that user, create new entity
            await userModel.create({email, username, age, info, password:hashedPassword})
            response.redirect(`/login?email=${email}`)
        }
    }catch(err){
        //catch the error, and ask the user to retry. 
        console.log(err)
        errMsg.networkErr = 'Something goes wrong, please try again later.'
        response.render('register',{errMsg})
    }
}

const loginController = async(request,response)=>{
    const {email,password} = request.body
    
    //Regular expressions to standardize the format of email addresses and passwords.
    const emailReg = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/
    const passwordReg = /^[a-zA-Z0-9~!@&%#_]{6,16}$/

    const errMsg = {}

    //check the validation of the email address and password first 
    if(!emailReg.test(email)){
        errMsg.emailErr = "Email is not valid."
    }else if(!passwordReg.test(password)){
        errMsg.passwordErr = "Password is not valid."
    }
    
    //if there are some error, refresh the page with the error message 
    if(JSON.stringify(errMsg) !== '{}'){
        response.render('login',{errMsg})
        return
    }

    //if the email address and password is valid, try to find that at the database 
    try{
        //try to find this email entity
        let findResult = await userModel.findOne({email})
        if(findResult && bcrypt.compareSync(password,findResult.password)){
            //following actions are done after successfully login
            request.session._id = findResult._id
            response.redirect('/userCenter')
        }else{
            //tell the user, the information is not found
            errMsg.loginErr = 'Email or password is wrong!'
            return response.render('login',{errMsg})
        }
    }catch(err) {
        //catch the error, and ask the user retry
        errMsg.networkErr = 'Something goes wrong, please try again later.'
        response.render('login',{errMsg})

    }

}

const logoutController = (req,res)=>{
    req.session.destroy(err=> {
        // We clear out the cookie here.
        //the user won't be able to authenticate with that same cookie again.
        if(err){
            console.log(err)
        }else{
            res.clearCookie('user')
            res.redirect('/')
        }
    })
}

const userCenterController = async (request,response)=>{
    //according the the cookie of the user, to identify the user
    const {_id} = request.session
    if(_id){
        let result = await userModel.findOne({_id})
        //if this is our user, find out what this user has already uploaded
        if(result){
            let allfiles = [];
            await fileModel.find()
                    .lean()
                    .then(function(doc) {
                        var i = 0;
                        for(i=0; i<doc.length; i++){
                            if(doc[i].useremail===result.email){
                                allfiles.push(doc[i].filename);
                            }
                        } 
                    });
            //use these information to generate the userCenter Page
            response.render('userCenter',{username:result.username, 
            userEmail:result.email, userAge:result.age, userInfo:result.info, 
            allfiles:allfiles, numOfFile:allfiles.length});
        }else{
            //otherwise, if the cookie the user give use of not correct, redirect to the 
            //login page. 
            console.log('The user illegally change the cookie')
            response.redirect('/login')
        }
    }else{
        //if there is no cookie, then redirect to the login page
        response.redirect('/login')
    }
}

module.exports = {
    rootController,
    registerController,
    loginController,
    logoutController,
    userCenterController
}
