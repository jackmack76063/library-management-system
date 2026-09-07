 /* Citation for the following function:
Date: 11/21/2024
Adapted from CS 340: nodejs-starter-app (app.js)
Majority of the code was copied from the sample code given, and modified based on individual project tables. 
Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%200%20-%20Setting%20Up%20Node.js

Updated for Postgres (Neon): callback returns (error, result) with result.rows;
'?' placeholders became '$1, $2, ...'.
*/

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

// GET route for the libraries page
router.get('/libraries', function(req, res) {
    let queryLibraries = 'SELECT libraryid AS "libraryID", libraryname AS "libraryName", libraryaddress AS "libraryAddress", contactnumber AS "contactNumber" FROM Libraries;';  // Aliased so Postgres's lowercased column names match the camelCase the .hbs templates expect

    db.pool.query(queryLibraries, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.render('libraries', {
                data: results.rows
            });
        }
    });
});

// POST route for adding a new library
router.post('/libraries/add', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Libraries (libraryName, libraryAddress, contactNumber) VALUES ($1, $2, $3)`;
    let inserts = [data.name, data.address, data.contact];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/libraries');  // Redirect back to /libraries after adding a new library
        }
    });
});

// POST route for updating a library
router.post('/libraries/update/:libraryID', function(req, res) {
    let libraryID = req.params.libraryID;
    let data = req.body;

    let query = `UPDATE Libraries SET libraryName = $1, libraryAddress = $2, contactNumber = $3 WHERE libraryID = $4`;
    let inserts = [data.name, data.address, data.contact, libraryID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/libraries');  // Redirect back to /libraries after updating the library
        }
    });
});

// POST route for deleting a library
router.post('/libraries/delete/:libraryID', function(req, res) {
    let libraryID = req.params.libraryID;

    let query = `DELETE FROM Libraries WHERE libraryID = $1`;
    let inserts = [libraryID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            // Postgres error code 23001 = restrict_violation (blocked by an ON DELETE RESTRICT rule)
            // 23503 = foreign_key_violation (a more general FK error)
            if (error.code === '23001' || error.code === '23503') {
                res.status(400).send(
                    '<p>Cannot delete this library — it still has books tied to active checkouts. Delete or reassign those checkouts first.</p>' +
                    '<a href="/libraries">Back to Libraries</a>'
                );
            } else {
                res.sendStatus(500);
            }
        } else {
            res.redirect('/libraries');  // Redirect back to /libraries after deleting the library
        }
    });
});

module.exports = router;
