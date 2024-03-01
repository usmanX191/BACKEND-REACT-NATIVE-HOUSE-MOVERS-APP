const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const User = mongoose.model('User');



module.exports = (req, res, next) => {
  if (req.cookies.jwt) {
    req.headers.authorization = `Bearer ${req.cookies.jwt}`;
  } else {
    console.log("cookies in auth", req.cookies.jwt);
    return res.status(401).json({ error: "You must be logged in. Token is not provided." });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in. Token is not provided." });
  }
  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in." });
    }
    const { _id, e_id } = payload;

    Team.findById(_id)
      .then((userdata) => {
        if (!userdata) {
          // Team not found, check for User
          User.findOne({ _id })
            .then((user) => {
              if (user) {
                console.log("cutomer",user.id);
                res.cookie('userId', user._id.toString()); // Save the user ID in the cookie
              }
              // Continue to next middleware even if user is not found
              req.team = null; // Set req.team to null since Team is not found
              next();
            })
            .catch((error) => {
              console.error("Error finding user:", error);
              res.status(500).json({ error: "Internal server error" });
            });
        } else {
          // Team found
          req.team = userdata;

          if (e_id) {
            if (userdata.worker && userdata.worker.Driver) {
              const foundDriver = userdata.worker.Driver.find(driver => driver._id.toString() === e_id);
              if (!foundDriver) {
                return res.status(422).send({ error: 'Driver does not exist' });
              }
              console.log('found driver');
              res.cookie('driverId', foundDriver._id.toString()); // Save driverId in the cookie

            } else if (userdata.worker && userdata.worker.labour) {
              const foundLabour = userdata.worker.labour.find(labour => labour._id.toString() === e_id);
              if (!foundLabour) {
                return res.status(422).send({ error: 'Labour does not exist' });
              }
              console.log('found labour');
              res.cookie('labourId', foundLabour._id.toString()); // Save labourId in the cookie
            }
          } else {
            // No e_id provided, save userId in the cookie for other routes
            res.cookie('userId', userdata._id.toString());
            console.log('found user');
          }

          next();
        }
      })
      .catch((error) => {
        console.error("Error finding user employee:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  });
};





  



