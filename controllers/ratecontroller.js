/*
* Rate Controllers
* */
//import Model
let userModel = require('../database/model/userModel');
let fileModel = require('../database/model/fileModel');
let rateModel = require('../database/model/rateModel');



const rateFileController = async(req,res)=>{
    const {_id} = req.session;
    //find the user in the user collection
    let currentUser = await userModel.findOne({_id});
    //find the file in the file collection
    let fileinfo = await fileModel.findOne({filename:req.params.this_filename});

    //check whether this user have already rated this file before
    //find the rate record in the rate collection
    let rateRecord = await rateModel.findOne({useremail:currentUser.email,
        filename:req.params.this_filename});
    
    if(rateRecord){

        //the user has already updated the file
        var oldRate = rateRecord.rate;
        var newRate = req.body.score;
        //number of people that rate this file doesn't change
        var newNumOfRate = fileinfo.numOfRate;
        //calculate the new score
        var newScore = ((fileinfo.currentRate*newNumOfRate-oldRate+newRate)/newNumOfRate)
        .toFixed(2);
        //update the new score into the file data base/
        await fileModel.updateOne({filename:req.params.this_filename}, {numOfRate: 
        newNumOfRate,currentRate:newScore}, function(err, docs){
            if(err) console.log(err);
            console.log('Change success：' + docs);
        })
        //update this rate information in rate collection
        try{
            //change the rate of current user to that file. 
            await fileModel.updateOne({useremail:currentUser.email,
            filename:req.params.this_filename}, {rate:req.body.score}, function(err, 
            docs){
                if(err) console.log(err);
                console.log('Change success：' + docs);
            })
        }catch(err){
            //catch the error message
            console.dir(err);
            console.dir("cannot update to database")
        };
        res.end("Thanks for updating the score, see our other files :>");
    }else{
        //the user never rate this file before
        //update the rate in the file collection
        var newNumOfRate = fileinfo.numOfRate+1;
        //calculate the new score
        var newScore = ((fileinfo.currentRate*(newNumOfRate-1)+req.body.score)
        /newNumOfRate).toFixed(2);
        await fileModel.updateOne({filename:req.params.this_filename}, {numOfRate: 
            newNumOfRate,currentRate:newScore}, function(err, docs){
            if(err) console.log(err);
            console.log('Change success：' + docs);
        })
        //update this rate information to the database 
        try{
            //create the mongodb document
            var rateEntity = new rateModel({useremail:currentUser.email, 
                filename:req.params.this_filename, rate:req.body.score});
            //save to the collection
            rateEntity.save();
        }catch(err){
            //catch the error message
            console.dir(err);
            console.dir("cannot update to database")
        };
        res.end(
        "Thank you for submitting rate (refresh the page, you will see the new rate)");
    }
}

module.exports = {
    rateFileController
}
