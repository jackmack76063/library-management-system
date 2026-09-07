 /* Citation for the following function:
Date: 11/21/2024
Adapted from CS 340: nodejs-starter-app (app.js)
Majority of the code was copied from the sample code given, and modified based on individual project tables. 
Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%200%20-%20Setting%20Up%20Node.js

Updated for Postgres (Neon): the queryDatabase() helper now unwraps
result.rows before resolving, so every route below stays exactly as it
was in terms of using the resolved value as a plain rows array.
'?' placeholders became '$1, $2, ...'.
*/


const express = require('express');
const router = express.Router();
const db = require('../database/db-connector');  

// Helper function to execute a query and return a promise
function queryDatabase(query, inserts = []) {
    return new Promise((resolve, reject) => {
        db.pool.query(query, inserts, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
}

// GET route for the main /staff page
router.get('/staff', async function(req, res) {
    try {
        let queryStaff = `
            SELECT Staff.staffID, Staff.staffName, Staff.staffTitle, Staff.staffExtension, Libraries.libraryName, Staff.librariesLibraryID
            FROM Staff 
            LEFT JOIN Libraries ON Staff.librariesLibraryID = Libraries.libraryID;
        `;
        let queryLibraries = "SELECT * FROM Libraries;";

        const [staffRows, libraryRows] = await Promise.all([
            queryDatabase(queryStaff),
            queryDatabase(queryLibraries)
        ]);

        res.render('staff', {
            data: staffRows,
            libraries: libraryRows
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// GET route for editing a staff member
router.get('/staff/update/:staffID', async function(req, res) {
    let staffID = req.params.staffID;

    try {
        let queryStaff = `SELECT * FROM Staff WHERE staffID = $1;`;
        let queryLibraries = "SELECT * FROM Libraries;";

        const [staffRows, libraryRows] = await Promise.all([
            queryDatabase(queryStaff, [staffID]),
            queryDatabase(queryLibraries)
        ]);

        res.render('staffUpdate', {
            staff: staffRows[0],
            libraries: libraryRows
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// POST route for adding a new staff member
router.post('/staff/add', async function(req, res) {
    let data = req.body;

    let query = `
        INSERT INTO Staff (staffName, staffTitle, staffExtension, librariesLibraryID)
        VALUES ($1, $2, $3, $4)
    `;
    let inserts = [data.staffName, data.staffTitle, data.staffExtension, data.librariesLibraryID || null];

    try {
        await queryDatabase(query, inserts);
        res.redirect('/staff');
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// POST route for deleting a staff member
router.post('/staff/delete/:staffID', async function(req, res) {
    let staffID = req.params.staffID;

    let query = `DELETE FROM Staff WHERE staffID = $1`;
    let inserts = [staffID];

    try {
        await queryDatabase(query, inserts);
        res.redirect('/staff');
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// POST route for updating a staff member
router.post('/staff/update/:staffID', async function(req, res) {
    let staffID = req.params.staffID;
    let data = req.body;

    let query = `
        UPDATE Staff 
        SET staffName = $1, staffTitle = $2, staffExtension = $3, librariesLibraryID = $4
        WHERE staffID = $5
    `;
    let inserts = [data.staffName, data.staffTitle, data.staffExtension, data.librariesLibraryID || null, staffID];

    try {
        await queryDatabase(query, inserts);
        res.redirect('/staff');
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;
