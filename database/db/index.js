/*
*
* This module is used to connect mongodb database and export a promise instance
* */

//require('dotenv').config()

//import mongoose
let mongoose = require('mongoose')
mongoose.set('useCreateIndex',true)


//definition
const DB_NAME = 'userdatabase'
const DB_URL = 'dbuser:2020info30005@test-ryy97.mongodb.net'

//create a promise instance
let dbPromise = new Promise(((resolve, reject) => {
    //connect
    mongoose.connect(`mongodb+srv://example",{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex: true,
        useFindAndModify: false,

    })
    //listen
    const db = mongoose.connection
    db.on('open', (err)=>{
        if(!err){
            console.log(`Database connect success`)
            resolve()
        }else{
            reject(err)
        }
    })
    db.once('open', async()=>{
        console.log("Mongo connection started on "+db.host+":"+db.port)
    })
}))

//export
module.exports = dbPromise
