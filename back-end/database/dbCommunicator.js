require("dotenv").config();
const mongoose = require("mongoose");
const accountModel = require("./models/accountModel");
const addressBookModel = require("./models/addressBookModel");

//connect to database

const connectToDB = async (dbUrl) => {
       await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
       }).then(() => {
        console.log("DB is connected")
    });
}

//address book updates

const addAccountOwner = async (accountOwnerData) => {
    try {
        const doc = new addressBookModel(accountOwnerData);
        await doc.save();
        return true;
    } catch (err) {
        throw err;
    }
}

//update record by adding an address to this account_owner's addressbook array
const addAddressToAddressBook = async (accountOwner, newAddress, newAddressName) => {
    try {
        let addressBook;
        const getDoc = await addressBookModel.findOne({owner_address: accountOwner});
        addressBook = getDoc.address_book;
        addressBook.push({
            address: newAddress,
            name: newAddressName
        });
        const update = await addressBookModel.updateOne(
            {owner_address: accountOwner},
            {address_book: addressBook}
        );

        return update.acknowledged
    } catch (err) {
        throw err;
    }
}

const removeAddressFromAddressBook = async (accountOwner, addressToRemove) => {
    try {
        let addressBook;
        const getDoc = await addressBookModel.findOne({owner_address: accountOwner});
        addressBook = getDoc.address_book;
        console.log("old address book", addressBook)
        let filtered = addressBook.filter(record => record.address !== addressToRemove);
        console.log("new address book:", filtered)
        const update = await addressBookModel.updateOne(
            {owner_address: accountOwner},
            {address_book: filtered}
        );

        return update.acknowledged;
    } catch (err) {
        throw err;
    }
}

const getAddressBookData = async (accountOwner) => {
    try {
        const record = await addressBookModel.findOne({owner_address: accountOwner});
        return record;
    } catch (err) {
        console.log(err)
    }
}

const addAccountToDB = async (initAccountData) => {
    try {
        const doc = new accountModel(initAccountData);
        await doc.save();
        return true;
    } catch (err) {
        console.log(err)
    }
}


const getAccountData = async (accountOwner) => {
    try {
        const record = await accountModel.findOne({address: accountOwner});
        return record;
    } catch (err) {
        console.log(err)
    }
}

const addTransferToDB = async (fromAccount, transferData) => {
    try {
        let accountTransfers;
        const getDoc = await accountModel.findOne({address: fromAccount});
        accountTransfers = getDoc.transfers;
        accountTransfers.push(transferData);
        const update = await accountModel.updateOne(
            {address: fromAccount},
            {transfers: accountTransfers}
        );
        return update.acknowledged;
    } catch (err) {
        console.log(err)
    }
}




//account updates

const Communicator = {
    connectToDB,
    addAccountOwner,
    addAddressToAddressBook,
    removeAddressFromAddressBook,
    getAddressBookData,
    addAccountToDB,
    addTransferToDB,
    getAccountData
}

module.exports = Communicator;