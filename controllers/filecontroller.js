/*
* File Controllers
**/

//import
let fs= require('fs');
let userModel = require('../database/model/userModel');
let fileModel = require('../database/model/fileModel');
global.Blob = require('blob');



/************ all the modules that implement Azure cloud storage*********************/

require('dotenv').load();
const
      multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('file')
    , azureStorage = require('azure-storage')
    , blobService = azureStorage.createBlobService()
    , getStream = require('into-stream')
    , containerName = 'studyresource'
;
/************ all the modules that implement Azure cloud storage*********************/

//this function is used to generate unique filename 
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); 
    return `${identifier}-${originalName}`;
};

/*************controllers*************/
/*check user's identity before he go to the upload page*/
const checkValidBeforeUpload = async (request,response)=>{
    //check the user's cookie
    const {_id} = request.session
    if(_id){
        //if the cookie is belong to one of our user
        let result = await userModel.findOne({_id})
        if(result){
            //direct to the upload page
            response.render('upload',{update_infomation:""})
        }else{
            //otherwiser, ask he to login again 
            console.log('The user illegally change the cookie')
            response.redirect('/login')
        }
    }else{
        //if there is no cookie, also ask him to login
        response.redirect('/login')
    }
}

/*upload the file information to mongodb*/
const uploadFileController = async(req, res) => {
    //get user information
    const {_id} = req.session
    const result = await userModel.findOne({_id})
    //get user input by multer. 
    const level = req.body.level;
    const subject = req.body.subject;
    const desc = req.body.desc;
    const this_filename = req.file.originalname;
    const this_filesize = req.file.size;
    /* there is a communication diagram on report, demonstrate why works like that */
    //if the file has already being uploaded
    let oldfileinfo = await fileModel.findOne({filename:this_filename, 
        filesize:this_filesize});
    //ask the user to upload again. 
    if(oldfileinfo){
        res.render('upload', {update_infomation:
            "Sorry, we have already have this file, would please update a new one?Thank you for your sharing"});
    }else{
        //otherwise, create a unique name for this file first
        this_blobName = getBlobName(this_filename);
        try{
            //create the mongodb document to record all the file information
            var fileEntity = new fileModel({uniquefilename:this_blobName,
                                            filename:this_filename,
                                            useremail:result.email,
                                            level:level, 
                                            subject:subject, 
                                            desc:desc, 
                                            filesize:this_filesize,
                                            numOfRate:0, 
                                            currentRate:5});
            //save to the collection
            fileEntity.save();
        }catch(err){
            //catch the error message
            console.dir(err);
            res.render('upload',{update_infomation:"upload fail, please try again"});
        };
    
        //upload the file itself to azure with its original file name
        //copy this part form the Azure document 
        //https://azure.microsoft.com/en-us/services/storage/blobs/
        const
              blobName = this_blobName
            , stream = getStream(req.file.buffer)
            , streamLength = req.file.buffer.length
        ;
        blobService.createBlockBlobFromStream(containerName, blobName, stream, 
        streamLength, err => {
            if(err) {
                console.dir(err);
                return;
            }
            res.render('success', { message: 'File uploaded to Azure Blob storage.'});
        });
    }
}

/*get all the files' information from mongodb list their file name on this page*/
const listAllFileController = async(req,res)=>{
    let allfiles = [];
    //go to the mongodb, find out all the file information
    await fileModel.find()
            .lean()
            .then(function(doc) {
                var i = 0;
                for(i=0; i<doc.length; i++){
                    allfiles.push(doc[i].filename);
                } 
            });
    //print all the filenames that exist to the user
    res.render('downloadpage',{allfiles:allfiles,numOfResult:allfiles.length,
        _id:req.session._id});
}

const filterResultController = async(req,res)=>{
    //fliter the result by it subject and fliters 
    //get user input
    var level = req.body.level;
    var subject = req.body.subject;
    var targetfilename = req.body.targetfilename;
    var fileReg
    //create regular expression to fliter the file name if it is require
    if(targetfilename==''){
        //if it is not require, match any string
        fileReg =new RegExp( "[\s\S]*");
    }else{
        //if it is require, match the string that contain the searched name 
        fileReg =new RegExp( targetfilename+"?","i");
    };

    //get all files' information from mongodb after fliter with the name, subject and
    //level. 
    let allfiles = [];
    await fileModel.find()
            .lean()
            .then(function(doc) {
                var i = 0;
                for(i=0; i<doc.length; i++){
                    //fliter its subject
                    if(doc[i].subject==subject||subject==0){
                        //fliter its level
                        if(doc[i].level==level||level==0){
                            //fliter by its input string, by defined reguler expression
                            if(fileReg.test(doc[i].filename)){
                                allfiles.push(doc[i].filename);
                            }
                        }
                    }
                } 
            });
    //print all the filenames that exist to the user
     res.render('downloadpage',{allfiles:allfiles,numOfResult:allfiles.length,
        _id:req.session._id});

}
/*list allfile information of this particular file on the document information page*/
const fileInfoController = async(req,res)=>{
    const {_id} = req.session
    if(_id){
        //if the user is our legal registered user
        let result = await userModel.findOne({_id})
        if(result){
            //get all the file information from the mongodb
            let fileinfo = await fileModel.findOne({filename:req.params.this_filename});
            //generate the file information page and send to the user. 
            res.render('fileinformation',{filename:fileinfo.filename,desc:fileinfo.desc,
                numOfRate:fileinfo.numOfRate, currentRate:fileinfo.currentRate});
        }else{
            //if the user is not, ask him to login
            console.log('The user illegally change the cookie')
            res.redirect('/login')
        }
    }else{
        //ask him to login
        res.redirect('/login')
    }
}

const downloadfileController = async(req,res)=>{
    //check whether this file is already in our server
    var fileexist = false;
    //if the file is already in the server, then we do not need to download from azure
    fs.exists(`./downloads/${req.params.filename}`, function(exists) {
        if(exists){
            fileexist=true;
        }
    });
    //get the file information from the 
    //there is a communication diagram in the report shows how why work like this 
    let fileinfo = await fileModel.findOne({filename:req.params.filename});
    //download file from the azure by its filename to the local server
    if(!fileexist){
        //the function that download the file from Azure
        //copy from Azure document 
        //https://azure.microsoft.com/en-us/services/storage/blobs
        const downloadBlob =  async (blobName, downloadFilePath) => {
            return new Promise((resolve, reject) => {
                const name = req.params.filename;
                blobService.getBlobToLocalFile(containerName, blobName, 
                    `${downloadFilePath}${name}`, function(error, serverBlob) {
                    if (error) {
                        console.dir("failure")
                        reject(error);
                    } else {
                        console.dir("success")
                        resolve(downloadFilePath);
                    }
                });
            });
        };
        //download file from azure by its unique filename to 'download' folder in server
        await downloadBlob(fileinfo.uniquefilename,'./downloads/');
    }
    //after it already exist on the server, make the user download it on his computer. 
    res.download(`./downloads/${req.params.filename}`,req.params.filename);
}
module.exports = {
    uploadStrategy,
    checkValidBeforeUpload,
    uploadFileController,
    listAllFileController,
    filterResultController,
    fileInfoController,
    downloadfileController 
}
