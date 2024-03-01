const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    "User_Name":{
        type : String,
        required : true,
    },
    "User_Email":{
        type : String,
        required : true,
    },
    "mobile": {
        type : String,
        required : true,
    },

    "Password": {
        type : String,
        required : true,
    },
})

mongoose.model('User', UserSchema);