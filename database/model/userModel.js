/*
* This module is used to create a user schema
* */

let mongoose = require('mongoose')

let Schema = mongoose.Schema

//create userSchema
let userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    info:{
        type:Schema.Types.Mixed
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    },
    enable_flag:{
        type:String,
        default: 'Y'
    }
},{collection:'users'});

let userModel = mongoose.model('user', userSchema)

module.exports = userModel