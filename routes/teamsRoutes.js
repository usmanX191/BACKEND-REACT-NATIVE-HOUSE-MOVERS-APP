const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Orders = mongoose.model('orders');
const requireToken = require('../middleWare/AuthTokenRequired');
const ObjectId = mongoose.Types.ObjectId;
//test
const Jacket = mongoose.model('Jacket');
// const Jacket = require('./models/jacket');
//
require('dotenv').config();
//
router.post('/test1', (req, res) => {
  

    // Create a new jacket document
    const newJacket = new Jacket({
      uname: 'John',
      review: 'Great jacket!',
      rate: 5
    });

    // Save the jacket document to the database
    newJacket.save()
      .then(() => {
        console.log('Jacket saved to the database');

        // Query the jackets collection
        Jacket.find()
          .then(jackets => {
            console.log('All jackets:', jackets);
            mongoose.disconnect(); // Disconnect from MongoDB
          })
          .catch(error => console.error(error));
      })
  
});



// API routes FOR handling Orders routes
router.post('/updateOrder', async (req, res) => {
  const { orderId, selectedLabours, selectedDriver } = req.body;

  try {
    const order = await Orders.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update selected labours
    if (selectedLabours) {
      const labourIds = selectedLabours.map((labour) => new ObjectId(labour._id));
      order.selectedTeam.selectedStaff = labourIds;
    }

    // Update selected driver
    if (selectedDriver) {
      const driverId = JSON.stringify(selectedDriver.id);
      const formattedDriverId = driverId.replace(/^"|"$/g, "");
      order.selectedTeam.selectedDriver = {
        driver_Id: formattedDriverId,
        driver_Location: {
          last_location: {
            longitude: "Unknown",
            latitude: "Unknown",
          },
        },
        status: "Unknown",
      };
    }

    // Update order status to "pending"
    order.status = "pending";

    // Save the updated order
    await order.save();
    

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/changeorderstatus', requireToken, async (req, res) => {
  console.log("change status");
  const id = req.body.id;
  const statusToChange = req.body.statusChange;

  try {
    const order = await Orders.findByIdAndUpdate(
      id,
      { $set: { status: statusToChange } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/addoders', (req, res) => {
  console.log('asdf');
  Orders.create({
    "status": "completed",
  "orderDetails": {
    "userDetails": {
      "name": "usman1122",
      "email": "john.doe@example.com",
      "phone": "1234567890"
    },
    "fromLocations": "123 Main Street",
    "toLocations": "456 Park Avenue",
    "setfair": 50.00,
    "itemsDetails": [
      {
        "name": "Item 1",
        "description": "Description of Item 1",
        "Quantity": 2
      },
      {
        "name": "Item 2",
        "description": "Description of Item 2",
        "Quantity": 1
      }
    ]
  },
  "selectedTeam": {
    "teamId": "647539ad934ccc66f547d827",
    "selectedStaff": [
      {
        "staffId": "648717a5e6cd5671f208a75b"
      },
      {
        "staffId": "64a17a8230b32804041962f0"
      }
    ],
    "selectedDriver": {
      "driver_Id": "6485fc8f2937a726e7c8cba7",
      "driver_Location": {
        "last_location": {
          "longitude": "45.6789",
          "latitude": "-78.1234"
        }
      },
      "status": "pending"
    }
  }
  }).then(() => {
    console.log('Order created successfully');
    res.sendStatus(200);
  }).catch((error) => {
    console.error('Error creating order:', error);
    res.sendStatus(500);
  });
});

router.get('/viewrequestedorders', requireToken, async (req, res) => {
  Orders.find({ "selectedTeam.teamId": req.cookies.userId, status: "requested" })
  // Orders.find({ status: "requested" })
    .then((temp) => {
      console.log(req.cookies.userId);
      console.log(temp);
      if (temp && temp.length > 0) {
        res.status(200).json(temp);
      } else {
        console.log('No matching documents found');
        res.status(404).json({ error: "No matching documents found" });
      }
    })
    .catch((error) => {
      console.error('Error fetching work data:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.get('/viewpendingorders', requireToken, async (req, res) => {
  Orders.find({ $or: [{ "selectedTeam.teamId": req.cookies.userId, status: "pending" }, { status: "addEmployee" }] })
  .then((temp) => {
    if (temp && temp.length > 0) {
      res.status(200).json(temp);
    } else {
      console.log('No matching documents found');
      res.status(404).json({ error: "No matching documents found" });
    }
  })
  .catch((error) => {
    console.error('Error fetching work data:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

});

router.get('/viewcompletedorders', requireToken, async (req, res) => {
  Orders.find({ $or: [{ "selectedTeam.teamId": req.cookies.userId, status: "completed" }, { status: "cancelled" }] })
  .then((temp) => {
    if (temp && temp.length > 0) {
      res.status(200).json(temp);
    } else {
      console.log('No matching documents found');
      res.status(404).json({ error: "No matching documents found" });
    }
  })
  .catch((error) => {
    console.error('Error fetching work data:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

});

router.post('/vieworders', requireToken, async (req, res) => {
  const orderId = req.body.id;

  Orders.findById(orderId)
    .then((temp) => {
      if (temp) {
        res.status(200).json(temp);
      } else {
        console.log('No matching document found');
        res.status(404).json({ error: 'No matching document found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching work data:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});



// API routes FOR handling team members routes

router.delete('/deleteteam', requireToken, async (req, res) => {
  if (req.body.roll === 'driver' || req.body.roll === 'Driver') {
    const D_cnic = req.body.Driver_cnic;
    if (!D_cnic) {
      return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
      const query = {
        'worker.Driver.D_cnic': D_cnic
      };
      console.log(D_cnic);
      Team.findOne(query, { 'worker.Driver.$': 1 })
        .then(async (team) => {
          if (team && team.worker.Driver && team.worker.Driver.length > 0) { // Check if the array exists and has elements
            const matchedElement = team.worker.Driver.find(
              (element) => element.D_cnic.toString() === D_cnic
            );
            if (matchedElement) {
              const filter = { _id: req.cookies.userId };
              const update = {
                $pull: {
                  'worker.Driver': {
                    D_cnic: D_cnic,
                  },
                },
              };
              await Team.updateOne(filter, update);
              return res.send({ success: 'Driver deleted successfully' });
            } else {
              console.log(matchedElement, 'error: Driver does not exist');
              return res.status(422).send({ error: 'Driver does not exist' });
            }
          } else {
            console.log('error: Driver does not exist');
            return res.status(422).send({ error: 'Driver does not exist' });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
  }
  else if (req.body.roll === 'labour' || req.body.roll === 'Labour') {
    const L_cnic = req.body.labour_cnic;
    if (!L_cnic) {
      return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
      const query = {
        'worker.labour.L_cnic': L_cnic
      };
      console.log(L_cnic);
      Team.findOne(query, { 'worker.labour.$': 1 })
        .then(async (team) => {
          if (team && team.worker.labour && team.worker.labour.length > 0) { // Check if the array exists and has elements
            const matchedElement = team.worker.labour.find(
              (element) => element.L_cnic.toString() === L_cnic
            );
            if (matchedElement) {
              const filter = { _id: req.cookies.userId };
              const update = {
                $pull: {
                  'worker.labour': {
                    L_cnic: L_cnic,
                  },
                },
              };
              await Team.updateOne(filter, update);
              return res.send({ success: 'labour deleted successfully' });
            } else {
              console.log(matchedElement, 'error: labour does not exist');
              return res.status(422).send({ error: 'labour does not exist' });
            }
          } else {
            console.log('error: labour does not exist');
            return res.status(422).send({ error: 'labour does not exist' });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
  }
});

router.get('/viewteam', requireToken, (req, res) => {
  
  Team.findOne({ _id: req.cookies.userId, worker: { $exists: true } })
    .then((temp) => {
      if (temp) {
        res.status(200).json(temp.worker);
      } else {
        console.log('No matching documents found');
        res.status(404).json({ error: "No matching documents found" });
      }
    })
    .catch((error) => {
      console.error('Error fetching wor data:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.post('/addteam', requireToken, async (req, res) => {
  const userId = req.cookies.userId;

  if (req.body.roll === 'driver' || req.body.roll === 'Driver') {
    const D_name = req.body.Driver_name;
    const D_phone = req.body.Driver_phone;
    const D_cnic = req.body.Driver_cnic;
    const D_roll = req.body.roll;
    const D_image = req.body.Driver_image;

    if (!D_name || !D_phone || !D_cnic || !D_roll) {
      console.log(req.body);
      return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
      const query = {
        _id: userId,
        'worker.Driver.D_cnic': D_cnic
      };

      Team.findOne(query, { 'worker.Driver.$': 1 })
        .then(async (team) => {
          if (team) {
            const matchedElement = team.worker.Driver.find(
              (element) => element.D_cnic.toString() === D_cnic
            );

            if (matchedElement) {
              console.log(matchedElement, 'error: Driver already exists');
              return res.status(422).send({ error: 'Driver already exists' });
            }
          }

          const filter = { _id: userId };
          const update = {
            $push: {
              'worker.Driver': {
                D_name: D_name,
                D_phone: D_phone,
                D_cnic: D_cnic,
                D_roll: D_roll,
              }
            }
          };

          await Team.updateOne(filter, update);
          return res.send({ success: 'Driver added successfully' });
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
  }
  else if (req.body.roll === 'labour' || req.body.roll === 'Labour') {
    const L_name = req.body.labour_name;
    const L_phone = req.body.labour_phone;
    const L_cnic = req.body.labour_cnic;
    const L_roll = req.body.roll;
    if (!L_name || !L_phone || !L_cnic || !L_roll ) {
      return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
      const query = {
        _id: userId,
        'worker.labour.L_cnic': L_cnic
      };

      Team.findOne(query, { 'worker.labour.$': 1 })
        .then(async (team) => {
          if (team) {
            const matchedElement = team.worker.labour.find(
              (element) => element.L_cnic.toString() === L_cnic
            );

            if (matchedElement) {
              console.log(matchedElement, 'error: labour already exists');
              return res.status(422).send({ error: 'labour already exists' });
            }
          }

          const filter = { _id: userId };
          const update = {
            $push: {
              'worker.labour': {
                L_name: L_name,
                L_phone: L_phone,
                L_cnic: L_cnic,
                L_roll: L_roll,
              }
            }
          };

          await Team.updateOne(filter, update);
          return res.send({ success: 'labour added successfully' });
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
  }
});




// API routes FOR handling vehical information routes

router.post('/addvehical', requireToken, async (req, res) => {
    const userId = req.cookies.userId;
  
    const vehical_name = req.body.V_name;
    const vehical_model = req.body.V_model;
    const vehical_manufacturer = req.body.V_manufacturer;
    const vehical_number = req.body.V_number;
    const vehical_capacity = req.body.V_capacity;
    const vehical_category = req.body.V_category;
  
    if (
      !vehical_name ||
      !vehical_model ||
      !vehical_manufacturer ||
      !vehical_number ||
      !vehical_capacity ||
      !vehical_category
    ) {
      return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
      const query = {
        _id: userId,
        'vehicle.V_number': vehical_number,
      };
  
      Team.findOne(query, { vehicle: 1 })
        .then(async (team) => {
          if (team) {
            const matchedElement = team.vehicle.find(
              (element) => element.V_number.toString() === vehical_number
            );
            if (matchedElement) {
              console.log(matchedElement, 'error: Vehicle already exists');
              return res.status(422).send({ error: 'Vehicle already exists' });
            }
          }
  
          const filter = { _id: userId };
          const update = {
            $push: {
              vehicle: {
                V_name: vehical_name,
                V_model: vehical_model,
                V_manufacturer: vehical_manufacturer,
                V_number: vehical_number,
                V_capacity: vehical_capacity,
                V_category: vehical_category,
              },
            },
          };
  
          await Team.updateOne(filter, update);
          return res.send({ success: 'Vehicle added successfully' });
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
  });

router.delete('/deletevehical',requireToken , async (req, res) => { 
    
    const vehical_number = req.body.V_number;
   

    if ( !vehical_number ) {
    return res.status(422).send({ error: 'Please fill all the fields' });
    } else {
    const query = {
        'vehicle.V_number': vehical_number,
    };

    Team.findOne(query, { vehicle: 1 })
        .then(async temp => {
        if (temp) {
            const matchedElement = temp.vehicle.find(
            element => element.V_number.toString() === vehical_number
            );
            if (matchedElement) {
                const filter = { _id: req.cookies.userId };
            const update = {
                $pull: {
                    vehicle: {
                        V_number: vehical_number,
                    },
                },
            } 
            await Team.updateOne(filter, update);
        } else {
            

            console.log(matchedElement, 'error: Vehicle dont exists');
                return res.status(422).send({ error: 'Vehicle dont exists' });
            };
            return res.send({ success: 'Vehicle deleted successfully' });

        }
        })
        .catch(error => {
          return res.status(500).send({ error: 'Internal Server Error' });
        });
    }
});

router.get('/viewvehical', requireToken, (req, res) => {
    Team.findOne({ _id: req.cookies.userId, vehicle: { $exists: true } })
      .then((temp) => {
        if (temp) {
          res.status(200).json(temp.vehicle);
        } else {
          console.log('No matching documents found');
          res.status(404).json({ error: "No matching documents found" });
        }
      })
      .catch((error) => {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  });





module.exports = router;