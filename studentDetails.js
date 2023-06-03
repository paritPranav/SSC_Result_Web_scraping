const mongoose = require("mongoose");



const studentDetailSchema=new mongoose.Schema({

   seat_Number:{
    type:String
   },
   mother_Name:{
    type:String
   }
        
})

module.exports=mongoose.model('StuentDetail',studentDetailSchema);