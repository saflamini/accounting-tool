const express = require("express");
const Router = express.Router();
const addressActions = require("./address");
const accountActions = require("./accounts");
const dataActions = require("./data");

Router.route("/hi").get((req, res) => {
    console.log('worked')
    res.send('working');
})

Router.route("/add-account-owner").post((req, res) => {
    try{
        console.log("running")
        const accountInfo = req.body;
        const newEntry = addressActions.registerAccountOwner(accountInfo);
        res.json(newEntry);
    } catch (err) {
        console.log(err)
    }
    
});

Router.route("/get-address-book/:account")
.get( async (req, res) => {
    try {
        console.log(req.params)
        const accountOwner = req.params.account;
        // const accountOwner = "0x3F047877e6613676d50Bf001b383682aDAeBE463"

        const data = await addressActions.getAddressBook(accountOwner);
        res.json(data);
        console.log(data)
    } catch (err) {
        console.log(err)
    }
    
})

Router.route("/add-internal-address/:account")
.put(async (req, res) => {
    try {
        const accountOwner = req.params.account;
        const { acctAddress, acctName } = req.body;
        console.log(acctAddress)
        console.log(acctName)
        const newUpdate = await addressActions.addAddressToAddressBook(accountOwner, acctAddress, acctName);
        res.json(newUpdate);
    } catch (err) {
        console.log(err)
    }
});

Router.route("/remove-internal-address:/account")
.put( async (req, res) => {
    try {
        const accountOwner = req.params.account;
        const { addressToRemove } = req.body;
        console.log(accountOwner);
        console.log(addressToRemove);
        addressActions.removeAddressBookAddress(accountOwner, addressToRemove)
    } catch (error) {
        console.log(error)
    }
});

Router.route("/add-erc20-transfer-from:/account")
.put( async (req, res) => {
    try {
        const fromAccount = req.params.account;
        const { erc20TransferFromData } = req.body;
        console.log(accountOwner);
        console.log(addressToRemove);
        accountActions.addERC20TransferFrom(fromAccount, erc20TransferFromData)
    } catch (error) {
        console.log(error)
    }
});

Router.route("/add-erc20-transfer-to:/account")
.put( async (req, res) => {
    try {
        const fromAccount = req.params.account;
        const { erc20TransferFromData } = req.body;
        console.log(accountOwner);
        console.log(addressToRemove);
        accountActions.addERC20TransferTo(fromAccount, erc20TransferToData)
    } catch (error) {
        console.log(error)
    }
});

Router.route("/get-csv-data/:account/:starttime/:endtime")
.get( async (req, res) => {
    try {
        const acct = req.params.account;
        const startTime = req.params.starttime
        const endTime = req.params.endtime
        let addressBookAddresses = [];
        const addressBookAccount = await addressActions.getAddressBook(acct);
        const book = addressBookAccount.address_book;
        for (let i = 0; i < book.length; i++) {
            addressBookAddresses.push(book[i].address);
        }
        const data = await dataActions.getCSVData(acct, addressBookAddresses, startTime, endTime);
        res.json(data);
        console.log(data);
    } catch (error) {
        console.log('there was an error');
        console.log(error)
    }
})



// Router.route("/add-token/:account-owner/:token-info").put((req, res) => {

// })


// Router.route("/generate-csv").get((req, res) => {

// });

module.exports = Router;
