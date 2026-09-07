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
            SELECT Staff.staffid AS "staffID", Staff.staffname AS "staffName", Staff.stafftitle AS "staffTitle", Staff.staffextension AS "staffExtension", Libraries.libraryname AS "libraryName", Staff.librarieslibraryid AS "librariesLibraryID"
            FROM Staff 
            LEFT JOIN Libraries ON Staff.librarieslibraryid = Libraries.libraryid;
        `;
        let queryLibraries = 'SELECT libraryid AS "libraryID", libraryname AS "libraryName" FROM Libraries;';

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
        let queryStaff = `SELECT staffid AS "staffID", staffname AS "staffName", stafftitle AS "staffTitle", staffextension AS "staffExtension", librarieslibraryid AS "librariesLibraryID" FROM Staff WHERE staffid = $1;`;
        let queryLibraries = 'SELECT libraryid AS "libraryID", libraryname AS "libraryName" FROM Libraries;';

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
        // Postgres error code 23001 = restrict_violation (blocked by an ON DELETE RESTRICT rule)
        // 23503 = foreign_key_violation (a more general FK error)
        if (error.code === '23001' || error.code === '23503') {
            res.status(400).send(
                '<p>Cannot delete this staff member — they still have checkouts on record. Reassign or delete those checkouts first.</p>' +
                '<a href="/staff">Back to Staff</a>'
            );
        } else {
            res.sendStatus(500);
        }
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
