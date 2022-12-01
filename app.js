const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
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

//root route
app.get("/", function (req, res) {
  res.render("home");
});

app.post("/", function (req, res) {
  const muscleWorked = req.body.newMuscle;
  const date = new Date();
  const timeStamp = date.toLocaleDateString();
  console.log(muscleWorked);

  //create new training document and add to db
  //may have to create a new route with muscleWorked and timestamp
  Training.create(
    { bodyPart: muscleWorked, date: timeStamp },
    function (err, workout) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully saved new workout for " + muscleWorked);
        //going to need to render correct workout using id. make a redirect to workout using id or timestamp
        //res.render("workout", { muscleGroup: muscleWorked, date: timeStamp });
        const workoutId = workout._id;
        console.log(workoutId);
        //add muscleWorked to url
        res.redirect("/workout/" + workoutId);
      }
    }
  );
});

//workout route where user will enter exercises for workout
app.get("/workout/:id", function (req, res) {
  const workoutId = req.params.id;

  Training.findById(workoutId, function (err, foundWorkout) {
    if (!err) {
      console.log(foundWorkout.bodyPart);
      res.render("workout", {
        muscleGroup: foundWorkout.bodyPart,
        timeStamp: foundWorkout.date,
      });
    }
  });
});

//exercise post route update training doc in db with exercise info entered by user
app.post("/workout/:id", function (req, res) {
  //need to get workout id from params so we can redirect to same page after saving exercise info in db
  console.log("In exercise route");
  console.log(req.params.id);
});

//NEED TO CREATE EXERCISE ENTRIES FOR WORKOUT IN EJS AND ADD TO DB RESPECTIVELY IN APP.JS

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

//traninigs route
app.get("/trainings", function (req, res) {
  Training.find({}, function (err, foundTrainings) {
    if (foundTrainings.length === 0) {
      //need to use create function. insertOne does not work here
      Training.create(defaultTraining, function (err) {
        if (!err) {
          res.send("Successfully added default training");
        } else {
          res.send(err);
        }
      });
    } else {
      console.log(foundTrainings);
      console.log(foundTrainings.date);
      res.render("workout", { muscleGroup: foundTrainings.bodyPart });
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
