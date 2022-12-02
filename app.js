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

  const newTraining = new Training({ bodyPart: muscleWorked, date: timeStamp });

  newTraining.save(function () {
    let workoutId = newTraining._id;
    console.log(newTraining._id);
    res.redirect("/workout/" + workoutId);
  });
});

//workout route where user will enter exercises for workout
app.get("/workout/:id", function (req, res) {
  const workoutId = req.params.id;

  Training.findById(workoutId, function (err, foundWorkout) {
    if (!err) {
      console.log(foundWorkout.bodyPart);
      res.render("workout", {
        workoutId: foundWorkout._id,
        muscleGroup: foundWorkout.bodyPart,
        timeStamp: foundWorkout.date,
      });
    }
  });
});

//updates workouts for training using its id
app.post("/update", function (req, res) {
  const workoutId = req.body.docId;
  const exerciseEntered = req.body.exercise;
  const weightEntered = req.body.weight;
  const setsEntered = req.body.sets;
  const repsEntered = req.body.reps;

  const newWorkout = new Workout({
    workout: exerciseEntered,
    weight: weightEntered,
    sets: setsEntered,
    reps: repsEntered,
  });

  Training.findByIdAndUpdate(
    workoutId,
    { $push: { routines: newWorkout } },
    function (err, foundTraining) {
      if (!err) {
        res.send("Successfully pushed new workout to routines array");
      } else {
        console.log(err);
      }
    }
  );
});

app.get("/history", function (req, res) {
  Training.find({}, function (err, foundTraining) {
    console.log(foundTraining);
    if (!err) {
      res.render("history", { trainings: foundTraining });
    }
  });
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
