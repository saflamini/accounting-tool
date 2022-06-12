const express = require('express');
const cors = require('cors')
const pool = require('./db');
const app = express();

app.use(cors()); //used when setting up middleware

app.use(express.json()); // this allows us to use req.body when making and getting requests

//ROUTES

app.post("/add-internal-address", async (req, res) => {
    try {

        const newAddressBookRecord = await pool.query(
            "INSERT INTO internal_accounts (account_owner, account_address, account_name) VALUES($1, $2, $3) RETURNING *",
            [req.body.connectedAddress, req.body.accountAddress, req.body.accountName]);

            console.log(newAddressBookRecord.rows)
            console.log('run complete')
    }
    catch (err) {
        console.error(err.message)
    }
});

module.exports = app;