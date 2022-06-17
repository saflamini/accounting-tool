const Communicator = require("../database/dbCommunicator");

const addTokenToDB = async (tokenInfo) => {
    try {
        console.log("adding token to database...", tokenInfo.symbol);
        return await Communicator.addTokenToDB(tokenInfo);
    } catch(err) {
        console.log("there was an error!")
        console.log(err);
    }
}

const tokenActions = {
    addTokenToDB
}

module.exports = tokenActions;