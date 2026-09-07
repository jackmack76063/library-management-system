/*
{{!-- Citation for the following function:
Date: 11/21/2024
Adapted from CS 340: nodejs-starter-app (index.hbs)
Majority of the code was copied from the sample code given, and modified based on individual project tables. 
Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%200%20-%20Setting%20Up%20Node.js --}} 
*/
// app.js

/*
    Updated for deployment (Neon + Render):
    - PORT now reads from process.env.PORT (Render assigns this dynamically;
      8728 is kept only as a local-development fallback).
    - The Staff query below now reads results.rows (pg's result shape),
      not just 'rows' directly (mysql's shape).
    - Removed the duplicate app.get('/') blocks for Books and Borrowers —
      Express only ever runs the FIRST matching handler for a route, so
      those two were dead code left over from earlier development; only
      the Staff version below was ever actually executing.
*/

/*
    SETUP
*/
// Express
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = process.env.PORT || 8728;  // Render assigns PORT automatically in production
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Database
var db = require('./database/db-connector')

// Handlebars
const { engine } = require('express-handlebars');
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.
const hbs = require('handlebars');
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
/*
    ROUTES
*/

// routes for 'Staff'
const staffRoutes = require('./routes/staffRoutes');  // Import staff routes
app.use('/', staffRoutes);  // Use staff routes

app.get('/', function(req, res)
    {  
        let query1 = "SELECT * FROM Staff;";               // Define our query

        db.pool.query(query1, function(error, results){    // Execute the query

           res.render('index', {data: results.rows});      // Render the index.hbs file, and also send the renderer
        })                                                  // an object where 'data' is equal to the rows we
    });                                                     // received back from the query

//routes for 'Books'
const booksRoutes = require('./routes/booksRoutes');  // Import books routes
app.use('/', booksRoutes);  // Use books routes

//routes for 'Borrowers'
const borrowersRoutes = require('./routes/borrowersRoutes');  // Import borrowers routes
app.use('/', borrowersRoutes);  // Use borrowers routes

//routes for 'Libraries'
const librariesRoutes = require('./routes/librariesRoutes');  // Import libraries routes
app.use('/', librariesRoutes);  // Use libraries routes

//routes for 'Checkouts'
const checkoutsRoutes = require('./routes/checkoutsRoutes');  // Import checkouts routes
app.use('/', checkoutsRoutes);  // Use checkouts routes

//routes for 'BooksBorrowers'
const booksBorrowersRoutes = require('./routes/booksBorrowersRoutes');
app.use('/', booksBorrowersRoutes);

 /*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
  console.log('Express started on port ' + PORT + '; press Ctrl-C to terminate.')
});
