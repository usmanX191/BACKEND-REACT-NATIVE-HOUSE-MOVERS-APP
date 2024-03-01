const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.mongo_url).then(() => {
    console.log('Connected to MongoDB');
})

.catch((err) => {
    console.log('could not connect to db'+err);
})