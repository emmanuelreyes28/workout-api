const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

//parse request
app.use(bodyParser.urlencoded({ extended: true }));
//store static files in public
app.use(express.static("public"));

//connect to database
mongoose.connect("mongodb://localhost:27017/workoutsDB", {
  useNewUrlParser: true,
});

//schema contents
const userSchema = {
  name: String,
  age: Number,
};

//collection within workoutsDB
const User = mongoose.model("User", userSchema);

//chain route handlers
app
  .route("/users")

  //fetch all users from workoutsDB
  .get(function (req, res) {
    User.find(function (err, foundUsers) {
      if (!err) {
        res.send(foundUsers);
      } else {
        res.send(err);
      }
    });
  })

  //post new data requested to workoutDB users collection
  .post(function (req, res) {
    const newUser = new User({
      name: req.body.name,
      age: req.body.age,
    });

    //save if no errors were encountered
    newUser.save(function (err) {
      if (!err) {
        res.send("Successfully added new user");
      } else {
        res.send(err);
      }
    });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
