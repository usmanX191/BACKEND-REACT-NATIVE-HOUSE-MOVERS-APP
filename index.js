const express = require('express');
const port = 3000;

const app = express();
const bodyParser = require('body-parser');
require('./db');
require('./models/team')  
require('./models/user')  
require('./models/test')  


const mongoose = require('mongoose');
require('./models/orders')  
require('./models/jacket')  
const orders = mongoose.model('orders');





const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const team_route = require('./routes/teamsRoutes');
const employee_route = require('./routes/employeeRoutes');
const user_route = require('./routes/userRoutes');
const requireToken = require('./middleWare/AuthTokenRequired');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(authRoutes);
app.use(team_route);
app.use(employee_route);
app.use(user_route);



app.get('/',requireToken,(req,res)=>{

    console.log(req.team,"team");
    res.send(req.team);
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

