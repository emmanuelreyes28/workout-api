Workout Log

This project first started as a REST API by using postman to send get, post, put, patch and delete requests. Then I figured I wanted to make this interactable with a front end. So I decided to use ejs templates to create the front end.

How it works:
User enters the muscle group they are training in the home page. Once submitted the backend sends a post request to create a new training document using mongoose. From here the user is redirected to route "/workout/:id" where :id is the id of the training document that was saved into the database. This route then renders the workout page where the user is able to enter their workout which includes name of exercise, weight (lbs), number of sets, and number of reps. With every logged workout the post "/update" route is called and saves the workout within the training document using its respective doc id in a form of emebedded documents. Once the doc is stored and saved into the db then the user is redirected to route "/workout/:id" where they are able to see their workout log update dynamically and are able to continue to enter more workouts. The user is also able to view their Workout History using the respective button which sends a get request to the "/history" route and renders the history page containing all of their logged workouts in a table format. 

How can this be improved?
* Create a sign-in/login page to track every users trainings seperately - create security with salting and hashing 
* A more flexible method of entering different weight, sets and reps within the same exercise 

Tools and dependencies used:
* MongoDB/Mongoose
* Postman
* Express
* EJS
* Body-Parser