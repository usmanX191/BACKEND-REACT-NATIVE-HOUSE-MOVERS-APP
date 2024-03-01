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

router.post('/addreview', async (req, res) => {
    try {
      const { team_id, review, rating, o_Id } = req.body;
      console.log(team_id);
      const team = await Team.findById(team_id); // Find the team by its _id
  
      if (!team) {
        // If the team with the given team_id is not found, send an appropriate response
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Add the review to the team's reviews array
      team.rating.reviews.push({
        orderId: o_Id, // Assuming the order ID is provided in the request body
        rating: rating,
        Comment: review,
      });
  
      // Calculate the overall_rating based on all the reviews
      let sumRatings = team.rating.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      team.rating.overall_rating = sumRatings / team.rating.reviews.length;
  
      // Save the updated team with the new review and overall_rating
      await team.save();
  
      res.json({ message: 'Review added successfully', overall_rating: team.rating.overall_rating });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
  
  
  
  
  


router.get('/showpendingordercustomer', requireToken, async (req, res) => {
    try {
      const id = req.cookies.userId;
  
      // Use the 'id' to fetch the user data from the database
      const user = await User.findOne({ _id: id });
  
      if (!user) {
        // If the user with the provided ID is not found
        return res.status(404).json({ error: 'User not found' });
      }
  
      const userEmail = user.User_Email;
  
      // Find all orders that have the same email as the currently authenticated user
      const ordersWithSameEmail = await orders.find({
        'orderDetails.userDetails.email': userEmail,
      });
  
      // If no orders found, you can return an empty array or a custom message
      if (ordersWithSameEmail.length === 0) {
        return res.json({ message: 'No orders found for this user' });
      }
  
      // If orders are found, return them in the response
      res.json({ orders: ordersWithSameEmail });
    } catch (error) {
      console.error("Error retrieving user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/contactdriver', async (req, res) => {
    try {
      const { team_id } = req.body;
      console.log(team_id);
      const team = await Team.findOne({  _id: team_id });
  
      if (!team) {
        // If the team with the given team_id is not found, send an appropriate response
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Assuming the team has a phone_no property representing the contact number
      const contact_no = team.phone_no;
  
      if (!contact_no) {
        // If the team does not have a valid contact number, send an appropriate response
        return res.status(400).json({ error: 'Contact number not available for the team' });
      }
  
      res.json({ contact_no });
    } catch (error) {
      console.error('Error retrieving team data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/viewteamsratings',requireToken ,async (req, res) => {
    try {
        console.log(req.cookies);
        const teams = await Team.find({}, 'Company_Name rating selectedTeam.teamId');
        const teamRatings = teams.map((team) => {
            console.log(String(team._id));
            return {
                company_name: team.Company_Name,
                overall_rating: team.rating ? team.rating.overall_rating : 0,
                team_id: String(team._id) ,
                userId: req.cookies.userId
            };
        });
        res.json(teamRatings);
    } catch (error) {
        console.error("Error retrieving team ratings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
  
router.post('/addodertodatabase', async (req, res) => {
    const orderPlaced = req.body;
    const U_id = orderPlaced.userId;
    console.log("OrderPlaced");
    console.log("do theis", orderPlaced.deliveryData.description);
    console.log("helli sfa", U_id);

    try {
        // Find the user details using the U_id
        const userDetails = await User.findOne({ _id: U_id });
        console.log("user ID", userDetails);
        // const fromLocations = JSON.stringify(orderPlaced.deliveryData.locations.pickLocation.pickupLocation);
        const fromLocations = orderPlaced.deliveryData.locations.pickLocation.pickupLocation;
        const toLocations = orderPlaced.deliveryData.locations.dropLocation.pickupLocation;

        // Prepare the new order data
        const newOrderData = {
            status: "pending",
            orderDetails: {
                userDetails: {
                    name: userDetails.User_Name,
                    email: userDetails.User_Email,
                    phone: userDetails.mobile
                },
                fromLocations,
                toLocations,
                itemsDetails: orderPlaced.deliveryData.description,
            },
            selectedTeam: {
                teamId: orderPlaced.selectedTeam.team_id,
            },
        };

        // Create a new instance of the orders model
        const newOrder = new orders(newOrderData);

        // Save the new order to the database
        await newOrder.save();

        res.status(201).json({ message: 'Order added successfully!' });
    } catch (error) {
        console.error("Error adding order to database:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;