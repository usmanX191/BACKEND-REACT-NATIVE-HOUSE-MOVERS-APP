const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const User = mongoose.model('User');
const orders = mongoose.model('orders');
const test = mongoose.model('MyModel');
const jwt = require('jsonwebtoken');
const requireToken = require('../middleWare/AuthTokenRequired');
//
require('dotenv').config();
//

    
router.post('/loginemployee', async (req, res) => {
    if (req.body.D_name && req.body.D_cnic) {
      const { D_name, D_cnic } = req.body;
      if (!D_name || !D_cnic) {
        return res.status(422).send({ error: 'Please fill all the fields' });
      }
      Team.findOne({ 'worker.Driver.D_name': D_name, 'worker.Driver.D_cnic': D_cnic })
        .then(async (foundTeam) => {
          if (!foundTeam) {
            return res.status(422).send({ error: 'Driver does not exist' });
          }
          try {
            console.log('Found driver in authroutes');
            const driver = foundTeam.worker.Driver.find(
              (driver) => driver.D_name === D_name && driver.D_cnic === D_cnic
            );
            const token = jwt.sign({ e_id: driver._id, _id: foundTeam._id }, process.env.JWT_SECRET);
            res.cookie('jwt', token);
            res.cookie('driverId', driver._id.toString()); // Save driver ID in the cookie
            res.cookie('userId', foundTeam._id.toString()); // Save driver ID in the cookie
            res.json({
              login: true,
              Token: token,
            });
          } catch (err) {
            console.log('db err ssss', err);
            res.json({ login: false });
          }
        });
    } else if (req.body.L_name && req.body.L_cnic) {
      const { L_name, L_cnic } = req.body;
      if (!L_name || !L_cnic) {
        return res.status(422).send({ error: 'Please fill all the fields' });
      }
      Team.findOne({ 'worker.labour.L_name': L_name, 'worker.labour.L_cnic': L_cnic })
        .then(async (foundTeam) => {
          if (!foundTeam) {
            return res.status(422).send({ error: 'Labour does not exist' });
          }
          try {
            console.log('Found labour in authroutes');
            const labour = foundTeam.worker.labour.find(
              (labour) => labour.L_name === L_name && labour.L_cnic === L_cnic
            );
            const token = jwt.sign({ e_id: labour._id, _id: foundTeam._id }, process.env.JWT_SECRET);
            res.cookie('jwt', token);
            res.cookie('labourId', labour._id.toString()); // Save labour ID in the cookie
            res.cookie('userId', foundTeam._id.toString()); // Save driver ID in the cookie
            res.json({
              login: true,
              Token: token,
            });
          } catch (err) {
            console.log('db err ', err);
            res.json({ login: false });
          }
        });
    } else {
      return res.status(422).send({ error: 'Please provide valid credentials' });
    }
});

router.post('/signupuser', async (req, res) => {
    const {User_Name,User_Email,mobile,Password} = req.body;
    if(!User_Name || !User_Email || !mobile || !Password){
        res.status(422).send({error : 'Please fill all the fields'});
        return console.log("gihar asfasdfasd");
    }


    User.findOne({User_Email: User_Email})
        .then(
            async (savedUser) => {
                if(savedUser){
                    return res.status(422).send({error : 'User already exists'});
                }
                const user = new User({
                    User_Name,
                    User_Email,
                    mobile,
                    Password 
                })
                try{
                    await user.save();
                    const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET);
                    res.send({ token });
                }
                catch(err){
                    console.log('db err ',err);
                    return res.status(422).send({error : err.message});
                }
            }
        )

})

router.post('/signupteam', async (req, res) => {
    const {Company_Name,Leader_Name,Leader_Email,Leader_CNIC,Password} = req.body;
    if(!Company_Name || !Leader_Name || !Leader_Email || !Leader_CNIC || !Password){
        res.status(422).send({error : 'Please fill all the fields'});
        return console.log("gihar asfasdfasd");
    }

    Team.findOne({Leader_CNIC: Leader_CNIC})
        .then(
            async (savedUser) => {
                if(savedUser){
                    console.log(savedUser);
                    return res.status(422).send({error : 'Leader already exists'});
                }
                const team = new Team({
                    Company_Name ,
                    Leader_Name,
                    Leader_Email,
                    Leader_CNIC,
                    Password 
                })
                try{
                    await team.save();
                    const token = jwt.sign({ _id: team._id}, process.env.JWT_SECRET);
                    res.send({ token });
                }
                catch(err){
                    console.log('db err ',err);
                    return res.status(422).send({error : err.message});
                }
            }
        )

})

router.post('/loginteam', async (req, res) => {
    const {Leader_Email,Password} = req.body;
    if(!Leader_Email || !Password){
        res.status(422).send({error : 'Please fill all the fields'});
    }
    console.log(Leader_Email);

    Team.findOne({Leader_Email: Leader_Email})  
        .then(
            async (savedUser) => {
                if(!savedUser){
                    return res.status(422).send({error : 'Leader dont exists'});
                }
                try{
                    if(savedUser.Password == Password){
                       
                        try{
                            console.log(savedUser);
                            const token = jwt.sign({ _id: savedUser._id}, process.env.JWT_SECRET);
                            res.cookie('jwt', token);
                            res.json({
                                login: true,
                                Token: token,
                            });
                        }
                        catch(err){
                            console.log('db err ',err);
                            return res.status(422).send({error : err.message});
                        }
                    }
                    else{
                        console.log(savedUser);

                        res.json({login: false});
                    }
                }
                catch(err){
                    console.log('db err ',err);
                    return res.status(422).send("Login Failed");
                }
            }
        )

   
})

router.post('/loginuser', async (req, res) => {
    const { User_Email, Password } = req.body;
    if (!User_Email || !Password) {
        return res.status(422).json({ error: 'Please fill all the fields' });
    }

    try {
        const savedUser = await User.findOne({ User_Email: User_Email });
        if (!savedUser) {
            return res.status(422).json({ error: 'Leader does not exist' });
        }

        if (savedUser.Password == Password) {
            const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
            res.cookie('jwt', token);
            console.log(token);
            return res.json({
                login: true,
                Token: token,
            });
        } else {
            return res.json({ login: false });
        }
    } catch (err) {
        console.log('db err ', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;