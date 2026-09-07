const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');  

// GET route for the borrowers page
router.get('/borrowers', function(req, res) {
  let queryBorrowers = 'SELECT userid AS "userID", username AS "userName", useraddress AS "userAddress", userphone AS "userPhone" FROM Borrowers;';
  let queryLibraries = 'SELECT libraryid AS "libraryID", libraryname AS "libraryName" FROM Libraries;';

  db.pool.query(queryBorrowers, function(error, results) {
      if (error) {
          console.error(error);
          res.sendStatus(500); 
      } else {
          const borrowersRows = results.rows;
          db.pool.query(queryLibraries, function(libError, libResults) {
              if (libError) {
                  console.error(libError);
                  res.sendStatus(500);  
              } else {
                  const libraryRows = libResults.rows;
                  res.render('borrowers', {
                      data: borrowersRows,
                      libraries: libraryRows
                  });
              }
          });
      }
  });
});


// POST route for adding a new book
router.post('/borrowers/add', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Borrowers (userName, userAddress, userPhone) VALUES ($1, $2, $3)`;
    let inserts = [data.userName, data.userAddress, data.userPhone];

    db.pool.query(query, inserts, function(error, results) {
        if (error) {
            console.error(error);
            res.sendStatus(500); 
        } else {
            res.redirect('/borrowers');  // Redirect back to /borrowers after adding a new patron
        }
    });
});
module.exports = router;
