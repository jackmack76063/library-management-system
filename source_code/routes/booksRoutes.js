const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');  

// GET route for the books page
router.get('/books', function(req, res) {
    let queryBooks = `SELECT Books.bookid AS "bookID", Books.booktitle AS "bookTitle", Books.bookauthor AS "bookAuthor", Books.bookgenre AS "bookGenre", Libraries.libraryname AS "libraryName" 
                  FROM Books 
                  JOIN Libraries ON Books.librarieslibraryid = Libraries.libraryid`;

    let queryLibraries = `SELECT libraryid AS "libraryID", libraryname AS "libraryName" FROM Libraries`;

    db.pool.query(queryBooks, function(bookError, bookResults) {
        if (bookError) {
            console.error(bookError);
            res.sendStatus(500);
        } else {
            const bookRows = bookResults.rows;
            db.pool.query(queryLibraries, function(libError, libResults) {
                if (libError) {
                    console.error(libError);
                    res.sendStatus(500);  
                } else {
                    const libraryRows = libResults.rows;
                    res.render('books', {
                        data: bookRows,
                        libraries: libraryRows
                    });
                }
            });
        }
    });
});


// POST route for adding a new book
router.post('/books/add', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Books (bookTitle, bookAuthor, bookGenre, librariesLibraryID) VALUES ($1, $2, $3, $4)`;
    let inserts = [data.bookTitle, data.bookAuthor, data.bookGenre, data.librariesLibraryID];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/books');  // Redirect back to /books after adding a new book
        }
    });
});

module.exports = router;
