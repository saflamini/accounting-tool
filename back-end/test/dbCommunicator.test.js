require("dotenv").config();
const mongoose = require("mongoose")
const { expect, assert } = require("chai");
const Communicator  = require("../database/dbCommunicator");

const dbUrl = process.env.DB_URL;
if (dbUrl === undefined) throw Error('dotenv failed to load DB_URL');

const dummyAddressBookData = {
    owner_address: "0x00000000000000000000000000000008",
    owner_timezone_offset: 0,
    address_book: [
        {
            address: "0x00000000000000000000000000000009",
            name: "Internal Account t"
        }
    ]
}

const newAddressBookRecord = {
    address: "0xDCB45e4f6762C3D7C6a1a00e96Fb94ADb7Cf27721",
    name: "Internal Account 3"
}

const sampleTransferData = {
    date: 1655001405,
    sender: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
    recipient: "0x3F047877e6613676d50Bf001b383682aDAeBE463",
    txHash: "0xf02ab204722c020e26be792aa543596db37ec3e90662031a8a7366e4cce2ed32",
    networkId: "137",
    amountToken: "1.22",
    amountUSD: "6.55",
    token: {
        id: "0xCAa7349CEA390F89641fe306D93591f87595dc1F",
        symbol: "USDCx",
        name: "Super USD Coin",
        underlyingAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    }
}

const sampleStreamData ={
    date: 1655001405,
	start: 1655001105,
	end: 0,
	sender: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
	recipient: "0x3F047877e6613676d50Bf001b383682aDAeBE463",
	networkId: "137",
	txHashes: [
        {
            timestamp: 1655001105,
            eventType: "flowStarted",
            hash: "0x576a993da3982ef0123244f805c68bba55fc83d04dad42baa804224b60affa30"
        }
    ],
	amountToken: "1.45678",
	amountUSD: "1.45678",
	token: {
		id: "0xCAa7349CEA390F89641fe306D93591f87595dc1F",
		symbol: "USDCx",
		name: "Super USD Coin",
		underlyingAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
	}
}

const sampleTokenData = {
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    symbol: "DAI",
	superTokenAddress: "0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2",
	decimals: "18",
    networkId: "137"
}


//Called hooks which runs before something.
before(async () => {

    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
       }).then(() => {
        console.log("DB is connected")
    });
     
    mongoose.connection
        .once("open", () => console.log("connected"))
        .on("error", (error) => console.log("an error occured on connection:", error))
});

beforeEach((done) => {
   mongoose.connection.collections.addressbooks.drop();
   mongoose.connection.collections.accountcollections.drop();
   mongoose.connection.collections.tokencollections.drop(() => {
    done();
   });

});

describe("db Communicator tests", () => {
    it("adds first address to address book", async () => {
        await Communicator.addAccountOwner(dummyAddressBookData)
            .then(async (added) => {
                expect(added).is.true;
                assert.ok(true)
            })
            .catch((err) => {
                console.log("ERROR: ", err)
                assert.ok(false);
            })

            const record = await Communicator.getAddressBookData(dummyAddressBookData.owner_address);
            expect(record.address_book[0].address).to.equal(dummyAddressBookData.address_book[0].address);
            expect(record.address_book[0].name).to.equal(dummyAddressBookData.address_book[0].name);
    })
    it("adds a new name to address book", async () => {
        console.log("adding first record...")
        await Communicator.addAccountOwner(dummyAddressBookData);
        console.log("running test to add entry to existing address book...")
        await Communicator.addAddressToAddressBook(dummyAddressBookData.owner_address, newAddressBookRecord.address, newAddressBookRecord.name)
            .then(async (added) => {
                expect(added).to.true
                assert.ok(true)
            })
            .catch((err) => {
                console.log("ERROR:", err)
                assert.ok(false);
            });
            const record = await Communicator.getAddressBookData(dummyAddressBookData.owner_address);
            expect(record.address_book[0].address).to.equal(dummyAddressBookData.address_book[0].address)
            
    })
    it("remove one from address book", async () => {
        console.log("adding first record...");
        await Communicator.addAccountOwner(dummyAddressBookData);
        console.log("adding a second entry to address book...");
        await Communicator.addAddressToAddressBook(dummyAddressBookData.owner_address, newAddressBookRecord.address, newAddressBookRecord.name);
        console.log("running test to remove item from address book")
        await Communicator.removeAddressFromAddressBook(dummyAddressBookData.owner_address, newAddressBookRecord.address)
            .then(async () => {
                const record = await Communicator.getAddressBookData(dummyAddressBookData.owner_address);
                assert.ok(true)
            })
            .catch((err) => {
                console.log("ERROR:", err);
                assert.ok(false)
            })
    })
    it("add account to DB", async () => {
        await Communicator.addAccountToDB({
            address: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
            transfers: [],
            streams: []
        }).then(async (added) => {
            expect(added).to.true;
            assert.ok(true)
        }).catch((err) => {
            console.log("ERROR: ", err);
            assert.ok(false);
        });

        const record = await Communicator.getAccountData("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");
        expect(record.address).to.equal("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");
    })
    it("add transfer to DB for account", async () => {
        console.log("Adding account to DB first...");
        await Communicator.addAccountToDB({
            address: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
            transfers: [],
            streams: []
        });
        console.log("Adding a transfer record to DB...");
        await Communicator.addTransferToDB("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721", sampleTransferData)
        .then(async (added) => {
            expect(added).to.true;
            assert.ok(true)
        })
        .catch((err) => {
            console.log("ERROR:", err );
            assert.ok(false)
        })
            const accountRecord = await Communicator.getAccountData("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");
            expect(accountRecord.transfers[0].date).to.equal(sampleTransferData.date);
            expect(accountRecord.transfers[0].sender).to.equal(sampleTransferData.sender);
            expect(accountRecord.transfers[0].recipient).to.equal(sampleTransferData.recipient);
            expect(accountRecord.transfers[0].txHash).to.equal(sampleTransferData.txHash);
            expect(accountRecord.transfers[0].networkId).to.equal(sampleTransferData.networkId);
            expect(accountRecord.transfers[0].amountToken).to.equal(sampleTransferData.amountToken);
            expect(accountRecord.transfers[0].amountUSD).to.equal(sampleTransferData.amountUSD);
            expect(accountRecord.transfers[0].token.id).to.equal(sampleTransferData.token.id);
            expect(accountRecord.transfers[0].token.symbol).to.equal(sampleTransferData.token.symbol);
            expect(accountRecord.transfers[0].token.name).to.equal(sampleTransferData.token.name);
            expect(accountRecord.transfers[0].token.underlyingAddress).to.equal(sampleTransferData.token.underlyingAddress);
    })
    it("add stream to DB", async () => {
        console.log("adding account to DB...");
        await Communicator.addAccountToDB({
            address: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
            transfers: [],
            streams: []
        });
        console.log("Adding a stream record to DB...");
        await Communicator.addStreamToDB("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721", sampleStreamData)
            .then(async (added) => {
                expect(added).to.true;
                assert.ok(true)
            })
            .catch((err) => {
                console.log("ERROR: ", err);
                assert.ok(false);
            });
        
        const accountRecord = await Communicator.getAccountData("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");
        expect(accountRecord.streams[0].date).to.equal(sampleStreamData.date);
        expect(accountRecord.streams[0].start).to.equal(sampleStreamData.start);
        expect(accountRecord.streams[0].end).to.equal(sampleStreamData.end);
        expect(accountRecord.streams[0].sender).to.equal(sampleStreamData.sender);
        expect(accountRecord.streams[0].recipient).to.equal(sampleStreamData.recipient);
        expect(accountRecord.streams[0].txHashes.timestamp).to.equal(sampleStreamData.txHashes.timestamp);
        expect(accountRecord.streams[0].txHashes.eventType).to.equal(sampleStreamData.txHashes.eventType);
        expect(accountRecord.streams[0].txHashes.hash).to.equal(sampleStreamData.txHashes.hash);
        expect(accountRecord.streams[0].networkId).to.equal(sampleStreamData.networkId);
        expect(accountRecord.streams[0].amountToken).to.equal(sampleStreamData.amountToken);
        expect(accountRecord.streams[0].amountUSD).to.equal(sampleStreamData.amountUSD);
        expect(accountRecord.streams[0].token.id).to.equal(sampleStreamData.token.id);
        expect(accountRecord.streams[0].token.symbol).to.equal(sampleStreamData.token.symbol);
        expect(accountRecord.streams[0].token.name).to.equal(sampleStreamData.token.name);
        expect(accountRecord.streams[0].token.underlyingAddress).to.equal(sampleStreamData.token.underlyingAddress);
    });
    it("adds token to token DB", async () => {
        console.log(sampleTokenData)
        await Communicator.addTokenToDB(sampleTokenData)
            .then(async (added) => {
                expect(added).to.true;
                assert.ok(true);
            })
            .catch((err) => {
                console.log("ERROR: ", err);
                assert.ok(false);
            });
        const tokenRecord = await Communicator.getTokenDataBySymbol("DAI");
        expect(tokenRecord.address).to.equal(sampleTokenData.address);
        expect(tokenRecord.symbol).to.equal(sampleTokenData.symbol);
        expect(tokenRecord.superTokenAddress).to.equal(sampleTokenData.superTokenAddress);
        expect(tokenRecord.decimals).to.equal(sampleTokenData.decimals);
        expect(tokenRecord.networkId).to.equal(sampleTokenData.networkId);
    })
});

