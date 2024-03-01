const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const orderId = new mongoose.Schema({
    "OrderId":{
        type : ObjectId,
        required : true
    },
});
const vehicleSchema = new mongoose.Schema({
    "V_name" : String,
    "V_model" : String,
    "V_manufacturer" : String,
    "V_number": String,
    "V_capacity": String,
    "V_category": String
});
const driverSchema = new mongoose.Schema({
    "D_name" : String,
    "D_phone" : String,
    "D_cnic" : String,
    "D_roll" : String,
    "D_image" : Buffer,
    "locaiton" : String,
});
const labourSchema = new mongoose.Schema({
    "L_name" : String,
    "L_phone" : String,
    "L_cnic" : String,
    "L_roll" : String,
    "L_image" : Buffer,
});



const teamSchema = new mongoose.Schema({
    "Company_Name": {
        type : String,
        required : true,
    },
    "Leader_Name":{
        type : String,
        required : true,
    },
    "Leader_Email":{
        type : String,
        required : true,
    },
    "Leader_CNIC":{
        type : String,
        required : true,
    },
    "Password": {
        type : String,
        required : true,
    },
    "phone_no": {
        type : String,
    },
    "worker":{
        "Driver":[driverSchema],
        "labour":[labourSchema]
    },
    "vehicle":[vehicleSchema],
    "requested_orders":[orderId],
    "pending_orders":[orderId],
    "Completed_orders":[orderId],
    "rating":{
        reviews: [
            {
                orderId: String,
                rating: Number,
                Comment: String
            },
        ],
        overall_rating: Number
    }    
})

mongoose.model('Team', teamSchema);