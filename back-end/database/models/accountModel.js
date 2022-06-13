const { model, Schema } = require('mongoose');

const accountSchema = new Schema({
	address: String,
	transfers: [
		{
			date: Number,
			sender: String,
			recipient: String,
			txHash: String,
			networkId: String,
			amountToken: String,
			amountUSD: String,
			token: {
				id: String,
				symbol: String,
				name: String,
				underlyingAddress: String
			}
		}
	],
	streams: [
		{
			date: Number,
			start: Number,
			end: Number,
			sender: String,
			recipient: String,
			networkId: String,
			txHashes: [
                {
                    timestamp: Number,
                    eventType: String,
                    hash: String
                }
            ],
			amountToken: String,
			amountUSD: String,
			token: {
				id: String,
				symbol: String,
				name: String,
				underlyingAddress: String
			}
		}
	]
});

const accountModel = model('accountCollection', accountSchema);

module.exports = accountModel;