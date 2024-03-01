const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const staffInfo = new mongoose.Schema({
    staffId: {
        type: String, 
    },
    status: String
});

const itemsinfo = new mongoose.Schema({
    name: String,
    description: String,
    Quantity: Number
});

const UserSchema = new mongoose.Schema({
    status: {
        type:String
    },
    orderDetails: {
        userDetails: {
            name : String,
            email : String,
            phone : String
        },
        fromLocations: {
            type:String,
        },
        toLocations: {
            type:String,
        },
        setfair:{
            type: Number,
        },
        itemsDetails: [itemsinfo],
    },
    selectedTeam: {
        teamId:{
            type: String,
            required: true,
        },
        selectedStaff: [staffInfo],
        selectedDriver: {
            driver_Id:{
                type: String,
                // required: true,
            },
            driver_Location: {
                last_location: {
                    longitude: String,
                    latitude: String
                }
            },
            status: String,
        },
    },
})

mongoose.model('orders', UserSchema);