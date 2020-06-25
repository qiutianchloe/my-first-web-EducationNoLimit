/*
* This module is used to create a user schema
* */

let mongoose = require('mongoose')

let Schema = mongoose.Schema

//create userSchema
let rateSchema = new Schema({
    useremail:{
        type:String,
        required:true,
    },
    filename:{
        type:String,
        required:true
    },
    rate:{
        type:Number,
        required:true
    }
},{collection: 'rate'});

let rateModel = mongoose.model('rate', rateSchema)

module.exports = rateModel