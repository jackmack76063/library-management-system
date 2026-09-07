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

// GET route for the booksBorrowers page
router.get('/booksBorrowers', function(req, res) {
    let queryBooksBorrowers = `
        SELECT Books.bookid AS "booksBookID", Books.booktitle AS "bookTitle", Borrowers.userid AS "borrowersUserID", Borrowers.username AS "userName"
        FROM BooksBorrowers
        JOIN Books ON BooksBorrowers.booksbookid = Books.bookid
        JOIN Borrowers ON BooksBorrowers.borrowersuserid = Borrowers.userid;
    `;
    let queryBooks = 'SELECT bookid AS "bookID", booktitle AS "bookTitle" FROM Books;';
    let queryBorrowers = 'SELECT userid AS "userID", username AS "userName" FROM Borrowers;';

    db.pool.query(queryBooksBorrowers, function(error, bbResults) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            const booksBorrowersRows = bbResults.rows;
            db.pool.query(queryBooks, function(bookError, bookResults) {
                if (bookError) {
                    console.error(bookError);
                    res.sendStatus(500);
                } else {
                    const bookRows = bookResults.rows;
                    db.pool.query(queryBorrowers, function(borrowerError, borrowerResults) {
                        if (borrowerError) {
                            console.error(borrowerError);
                            res.sendStatus(500);
                        } else {
                            const borrowerRows = borrowerResults.rows;
                            res.render('booksBorrowers', {
                                data: booksBorrowersRows,
                                books: bookRows,
                                borrowers: borrowerRows
                            });
                        }
                    });
                }
            });
        }
    });
});

// POST route for adding a new book-borrower relationship
router.post('/booksBorrowers/add', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO BooksBorrowers (booksBookID, borrowersUserID) VALUES ($1, $2)`;
    let inserts = [data.bookID, data.borrowerID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.redirect('/booksBorrowers');
        }
    });
});

// POST route for updating a book-borrower relationship
router.post('/booksBorrowers/update', function(req, res) {
    let data = req.body;

    let query = `
        UPDATE BooksBorrowers 
        SET booksBookID = $1, borrowersUserID = $2
        WHERE booksBookID = $3 AND borrowersUserID = $4
    `;
    let inserts = [data.bookID, data.borrowerID, data.originalBookID, data.originalBorrowerID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.redirect('/booksBorrowers');
        }
    });
});

// POST route for deleting a book-borrower relationship
router.post('/booksBorrowers/delete', function(req, res) {
    let data = req.body;

    let query = `DELETE FROM BooksBorrowers WHERE booksBookID = $1 AND borrowersUserID = $2`;
    let inserts = [data.bookID, data.borrowerID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.redirect('/booksBorrowers');
        }
    });
});

module.exports = router;
