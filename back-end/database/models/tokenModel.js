const { model, Schema } = require("mongoose");

const tokenSchema = new Schema({
	address: {
        type: String,
        required: [true, "must have an address"],
        unique: [true, "each token must have a unique address"]
    },
    symbol: String,
	superTokenAddress: String,
	decimals: String,
    networkId: {
        type: String,
        required: [true, "need a network id"]
    }
});

const tokenModel = model('tokenCollection', tokenSchema);

module.exports = tokenModel;