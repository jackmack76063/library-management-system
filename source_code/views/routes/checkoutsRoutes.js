 /* Citation for the following function:
Date: 11/21/2024
Adapted from CS 340: nodejs-starter-app (app.js)
Majority of the code was copied from the sample code given, and modified based on individual project tables. 
Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%200%20-%20Setting%20Up%20Node.js

Updated for Postgres (Neon): queryDatabase() now resolves with result.rows
(pg wraps rows in a result object; mysql returned the rows array directly).
'?' placeholders became '$1, $2, ...'.
*/

const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');

// Helper function to execute a query and return a promise
function queryDatabase(query) {
    return new Promise((resolve, reject) => {
        db.pool.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
}

// GET route for the checkouts page
router.get('/checkouts', async function(req, res) {
    try {
        let queryCheckouts = `
            SELECT 
                Checkouts.checkoutid AS "checkoutID", 
                Libraries.libraryname AS "libraryName", 
                Borrowers.username AS "borrowerName", 
                Staff.staffname AS "staffName", 
                Books.booktitle AS "bookTitle", 
                Checkouts.duedate AS "dueDate",
                Checkouts.librarieslibraryid AS "librariesLibraryID", 
                Checkouts.borrowersuserid AS "borrowersUserID", 
                Checkouts.staffstaffid AS "staffStaffID", 
                Checkouts.booksbookid AS "booksBookID"
            FROM Checkouts
            JOIN Libraries ON Checkouts.librarieslibraryid = Libraries.libraryid
            JOIN Borrowers ON Checkouts.borrowersuserid = Borrowers.userid
            JOIN Staff ON Checkouts.staffstaffid = Staff.staffid
            JOIN Books ON Checkouts.booksbookid = Books.bookid;
        `;

        let queryLibraries = 'SELECT libraryid AS "libraryID", libraryname AS "libraryName" FROM Libraries;';
        let queryBorrowers = 'SELECT userid AS "userID", username AS "userName" FROM Borrowers;';
        let queryStaff = 'SELECT staffid AS "staffID", staffname AS "staffName" FROM Staff;';
        let queryBooks = 'SELECT bookid AS "bookID", booktitle AS "bookTitle" FROM Books;';

        const [checkoutRows, libraryRows, borrowerRows, staffRows, bookRows] = await Promise.all([
            queryDatabase(queryCheckouts),
            queryDatabase(queryLibraries),
            queryDatabase(queryBorrowers),
            queryDatabase(queryStaff),
            queryDatabase(queryBooks)
        ]);

        res.render('checkouts', {
            data: checkoutRows,
            libraries: libraryRows,
            borrowers: borrowerRows,
            staff: staffRows,
            books: bookRows
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// POST route for adding a new checkout
router.post('/checkouts/add', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Checkouts (dueDate, librariesLibraryID, booksBookID, borrowersUserID, staffStaffID) VALUES ($1, $2, $3, $4, $5)`;
    let inserts = [data.dueDate, data.libraryID, data.bookID, data.borrowerID, data.staffID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/checkouts');  // Redirect back to /checkouts after adding a new checkout
        }
    });
});

// POST route for updating a checkout
router.post('/checkouts/update/:checkoutID', function(req, res) {
    let checkoutID = req.params.checkoutID;
    let data = req.body;

    let query = `
        UPDATE Checkouts 
        SET dueDate = $1, librariesLibraryID = $2, booksBookID = $3, borrowersUserID = $4, staffStaffID = $5 
        WHERE checkoutID = $6
    `;
    let inserts = [data.dueDate, data.libraryID, data.bookID, data.borrowerID, data.staffID, checkoutID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/checkouts');
        }
    });
});

// POST route for deleting a checkout
router.post('/checkouts/delete/:checkoutID', function(req, res) {
    let checkoutID = req.params.checkoutID;

    let query = `DELETE FROM Checkouts WHERE checkoutID = $1`;
    let inserts = [checkoutID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/checkouts');
        }
    });
});

module.exports = router;
