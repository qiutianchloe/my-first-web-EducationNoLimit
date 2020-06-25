/*
* This module is used to create a user schema
* */

let mongoose = require('mongoose')

let Schema = mongoose.Schema

//create userSchema
let fileSchema = new Schema({
    uniquefilename:{
        type:String,
        required:true,
        unique:true
    },
    filename:{
        type:String,
        required:true
    },
    useremail:{
        type:String,
        required:true
    },
    level:{
        type:Number,
        required:true
    },
    subject:{
        type:Number,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    filesize:{
        type:Number, 
        required:true
    },
    numOfRate:{
        type:Number,
        required:true
    },
    currentRate:{
        type:Number,
        required:true
    }
},{collection: 'file'});

let fileModel = mongoose.model('file', fileSchema)

module.exports = fileModel