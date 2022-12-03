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

//create new training document when user enters new training in root route
app.post("/", function (req, res) {
  const muscleWorked = req.body.newMuscle;
  const date = new Date();
  const timeStamp = date.toLocaleDateString();

  const newTraining = new Training({ bodyPart: muscleWorked, date: timeStamp });

  newTraining.save(function () {
    let workoutId = newTraining._id;
    res.redirect("/workout/" + workoutId);
  });
});

//workout route where user will enter exercises for workout
app.get("/workout/:id", function (req, res) {
  const workoutId = req.params.id;

  //find doc using id and pass values to ejs template
  Training.findById(workoutId, function (err, foundWorkout) {
    if (!err) {
      res.render("workout", {
        workoutId: foundWorkout._id,
        muscleGroup: foundWorkout.bodyPart,
        timeStamp: foundWorkout.date,
        exercises: foundWorkout.routines,
      });
    }
  });
});

//updates workouts for training using its id and redirect to same page with logged workout
app.post("/update", function (req, res) {
  const workoutId = req.body.docId;
  const exerciseEntered = req.body.exercise;
  const weightEntered = req.body.weight;
  const setsEntered = req.body.sets;
  const repsEntered = req.body.reps;

  //create new workout doc with values entered by user
  const newWorkout = new Workout({
    workout: exerciseEntered,
    weight: weightEntered,
    sets: setsEntered,
    reps: repsEntered,
  });

  //update training doc using doc id and pushing new workout entered
  Training.findByIdAndUpdate(
    workoutId,
    { $push: { routines: newWorkout } },
    function (err, foundTraining) {
      if (!err) {
        foundTraining.save(function () {
          res.redirect("/workout/" + workoutId);
        });
      } else {
        res.send(err);
      }
    }
  );
});

//renders all workouts entered into logs
app.get("/history", function (req, res) {
  Training.find({}, function (err, foundTraining) {
    if (!err) {
      res.render("history", { trainings: foundTraining });
    } else {
      res.send(err);
    }
  });
});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
