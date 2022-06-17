const Communicator = require("../database/dbCommunicator");

const addERC20TransferFrom = async (fromAccount, erc20TransferFromData) => {
    try {
        return await Communicator.addTransferToDB(fromAccount, erc20TransferFromData);

    } catch (err) {

        console.log("there was an error!")
        console.log(err);
    }
}

const addERC20TransferTo = async (toAccount, erc20TransferToData) => {
    try {
        return await Communicator.addTransferToDB(toAccount, erc20TransferToData);

    } catch (err) {

        console.log("there was an error!")
        console.log(err);
    }
}

const addSuperTokenTransfer = async (account, superTokenTransferData) => {
    try {
        return await Communicator.addTransferToDB(account, superTokenTransferData);
        
    } catch (err) {
        console.log('there was an error!');
        console.log(err);
    }
}


const accountActions = {
    addERC20TransferFrom,
    addERC20TransferTo,
    addSuperTokenTransfer
}

module.exports = accountActions;