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

const workoutSchema = {
  workout: String,
  weight: Number,
  sets: Number,
  reps: Number,
};

const trainingSchema = {
  bodyPart: String,
  date: String, //will be using Date() method to get string representation of current date
  routines: [workoutSchema], //array of workouts for that specified training routine
};

//collection within workoutsDB
const User = mongoose.model("User", userSchema);
const Workout = mongoose.model("Workout", workoutSchema);
const Training = mongoose.model("Training", trainingSchema);

//create sample documents using workoutSchema
const workoutOne = new Workout({
  workout: "Pull ups",
  weight: 0,
  sets: 3,
  reps: 10,
});

const workoutTwo = new Workout({
  workout: "ISO Lateral Incline Press",
  weight: 270,
  sets: 3,
  reps: 10,
});

const workoutThree = new Workout({
  workout: "Low Row Machine",
  weight: 120,
  sets: 3,
  reps: 12,
});

const defaultWorkouts = [workoutOne, workoutTwo, workoutThree];

//create sample traning doc using trainingSchema
const defaultTraining = new Training({
  bodyPart: "Chest and Back",
  date: Date(),
  routines: defaultWorkouts,
});

//chain route handlers

//users route
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

//workouts route
app.get("/workouts", function (req, res) {
  Workout.find({}, function (err, foundWorkouts) {
    //check if workouts collection is empty if so save default workouts
    if (foundWorkouts.length === 0) {
      Workout.insertMany(defaultWorkouts, function (err) {
        if (!err) {
          res.send("Successfully added default workouts");
        } else {
          res.send(err);
        }
      });
      //res.redirect("/");
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
