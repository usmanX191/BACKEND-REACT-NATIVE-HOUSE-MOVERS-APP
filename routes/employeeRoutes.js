const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Orders = mongoose.model('orders');
const requireToken = require('../middleWare/AuthTokenRequired');
const ObjectId = mongoose.Types.ObjectId;
//
require('dotenv').config();
//



// API to update the location of the driver
router.post('/updatedriverstatus', async (req, res) => {
    const { orderId, driverStatus } = req.body;
    if (driverStatus == "completed"){
      try {
        // Find the order based on the provided orderId
        const order = await Orders.findById(orderId);
    
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        // Update the status of the driver in the selectedTeam
        order.selectedTeam.selectedDriver.status = driverStatus;
        order.status = driverStatus;
        // Save the updated order
        await order.save();
    
        res.sendStatus(200);
      } catch (error) {
        console.error('Error updating driver status:', error);
        res.status(500).json({ error: 'Something went wrong' });
      }
    }
    else{
      try {
        // Find the order based on the provided orderId
        const order = await Orders.findById(orderId);
    
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
    
        // Update the status of the driver in the selectedTeam
        order.selectedTeam.selectedDriver.status = driverStatus;
    
        // Save the updated order
        await order.save();
    
        res.sendStatus(200);
      } catch (error) {
        console.error('Error updating driver status:', error);
        res.status(500).json({ error: 'Something went wrong' });
      }
    }
    
});

router.post('/updateLocation', async (req, res) => {
    const { orderId, latitude, longitude } = req.body;

    try {
      // Find the order based on the provided orderId
      const order = await Orders.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Update the driver's location in the order
      order.selectedTeam.selectedDriver.driver_Location.last_location = {
        latitude: latitude,
        longitude: longitude,
      };
  
      // Save the updated order
      await order.save();
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/showworkerdetailslabour', requireToken, async (req, res) => {
  console.log(req.cookies);
  const { userId } = req.cookies;
  const { driverId, labourId } = req.cookies;
  
  if (labourId) {
    console.log("labour is here in detaikls");
    Orders.find({
      'selectedTeam.teamId': userId,
      'selectedTeam.selectedStaff.staffId': labourId,
      'status': 'pending', // Filter orders with status "pending"
    })
      .then((order) => {
        console.log(order);
        res.json({ order });
      })
      .catch((error) => {
        console.error("Error finding orders:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } else {
    return res.status(422).send({ error: 'Please provide valid credentials' });
  }
});

router.get('/showworkerdetails', requireToken, async (req, res) => {
  console.log(req.cookies);
  const { userId } = req.cookies;
  const { driverId, labourId } = req.cookies;
  
  if (driverId) {
    console.log("driver is here in detaikls");
    Orders.find({
      'selectedTeam.teamId': userId,
      'selectedTeam.selectedDriver.driver_Id': driverId,
      'status': 'pending', // Filter orders with status "pending"
    })
      .then((order) => {
        console.log(order);
        res.json({ order });
      })
      .catch((error) => {
        console.error("Error finding orders:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } 
  else {
    return res.status(422).send({ error: 'Please provide valid credentials' });
  }
});

router.get('/showcompleteorderdriver', requireToken, async (req, res) => {
  console.log(req.cookies);
  const { userId } = req.cookies;
  const { driverId, labourId } = req.cookies;

  if (driverId) {
    Orders.find({
      'selectedTeam.teamId': userId,
      'selectedTeam.selectedDriver.driver_Id': driverId,
      'status': 'completed', // Filter orders with status "complete"
    })
      .then((orders) => {
        console.log(orders);
        res.json({ orders });
      })
      .catch((error) => {
        console.error("Error finding orders:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } else {
    return res.status(422).send({ error: 'Please provide valid credentials' });
  }
});

router.get('/showcompleteorderlabour', requireToken, async (req, res) => {
  console.log(req.cookies);
  const { userId } = req.cookies;
  const { driverId, labourId } = req.cookies;

  if (labourId) {
    Orders.find({
      'selectedTeam.teamId': userId,
      'selectedTeam.selectedStaff.staffId': labourId,
      'status': 'completed', // Filter orders with status "complete"
    })
      .then((orders) => {
        console.log(orders);
        res.json({ orders });
      })
      .catch((error) => {
        console.error("Error finding orders:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } else {
    return res.status(422).send({ error: 'Please provide valid credentials' });
  }
});
module.exports = router;