require("dotenv").config();
const mongoose = require("mongoose")
const { expect, assert } = require("chai");
const Communicator  = require("../database/dbCommunicator");

const dbUrl = process.env.MONGODB;
if (dbUrl === undefined) throw Error('dotenv failed to load DB_URL');

const dummyAddressBookData = {
    owner_address: "0x00000000000000000000000000000008",
    address_book: [
        {
            address: "0x00000000000000000000000000000009",
            name: "Internal Account t"
        }
    ]
}

const newAddressBookRecord = {
    address: "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721",
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
    mongoose.connection.collections.addressbooks.drop(() => {
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
                const record = await Communicator.getAddressBookData(added.owner_address);
                expect(added).to.true
                assert.ok(true)
            })
            .catch((err) => {
                console.log("ERROR:", err)
                assert.ok(false);
            })
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

            const transferRecord = await Communicator.getAccountData("0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");
            expect(transferRecord.transfers[0].date).to.equal(sampleTransferData.date);
            expect(transferRecord.transfers[0].sender).to.equal(sampleTransferData.sender);
            expect(transferRecord.transfers[0].recipient).to.equal(sampleTransferData.recipient);
            expect(transferRecord.transfers[0].txHash).to.equal(sampleTransferData.txHash);
            expect(transferRecord.transfers[0].networkId).to.equal(sampleTransferData.networkId);
            expect(transferRecord.transfers[0].amountToken).to.equal(sampleTransferData.amountToken);
            expect(transferRecord.transfers[0].amountUSD).to.equal(sampleTransferData.amountUSD);
            expect(transferRecord.transfers[0].token.id).to.equal(sampleTransferData.token.id);
            expect(transferRecord.transfers[0].token.symbol).to.equal(sampleTransferData.token.symbol);
            expect(transferRecord.transfers[0].token.name).to.equal(sampleTransferData.token.name);
            expect(transferRecord.transfers[0].token.underlyingAddress).to.equal(sampleTransferData.token.underlyingAddress);
    })
});

