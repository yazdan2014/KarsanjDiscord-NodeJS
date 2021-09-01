const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userId :{
        type:String ,
        required: true ,
        unique:true
    },
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
})



const profileModel = mongoose.model("ProfileModels" , profileSchema)

module.exports = profileModel
