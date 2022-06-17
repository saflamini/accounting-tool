const Communicator = require("../database/dbCommunicator");

const registerAccountOwner = async (accountOwnerData) => {
    try {
        console.log("adding an account owner...", accountOwnerData.owner_address);
        return await Communicator.addAccountOwner(accountOwnerData);

    } catch (err) {

        console.log("there was an error!")
        console.log(err);
    }
}

const addAddressBook = async (newAddressBookInfo) => {
    try {
        console.log("adding an internal account...", newAddress);
        return await Communicator.addAccountOwner(newAddressBookInfo)

    } catch (err) {
        console.log("there was an error!")
        console.log(err);
    }
}

const addAddressToAddressBook = async (accountOwner, newAddress, newAddressName) => {
    try {
        return await Communicator.addAddressToAddressBook(accountOwner, newAddress, newAddressName);
    } catch (error) {
        console.log("there was an error!");
        console.log(err)
    }
}

const removeAddressBookAddress = async (accountOwner, addressToRemove) => {
    try {
        console.log("removing an internal account... ", addressToRemove);
        return await Communicator.removeAddressFromAddressBook(accountOwner, addressToRemove);
    } catch (err) {
        console.log("there was an error!")
        console.log(err);
    }
}

const getAddressBook = async (accountOwner) => {
    try {
        return await Communicator.getAddressBookData(accountOwner);
    } catch (error) {
        console.log("there was an error!");
        console.log(err)
    }
}

const addressActions = {
    registerAccountOwner,
    addAddressBook,
    addAddressToAddressBook,
    removeAddressBookAddress,
    getAddressBook
}

module.exports = addressActions;