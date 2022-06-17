require("dotenv").config();
const express = require('express');
const cors = require('cors')
const app = express();
const fetch = require("cross-fetch");
const  http =  require('http');
const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client/core');
const ERC20ABI = require("./abis/ERC20ABI");
const ethers = require("ethers");
const Communicator = require("./database/dbCommunicator");
const Router = require("./routes/index");
const EthDater = require('ethereum-block-by-date');

app.use(cors()); //used when setting up middleware

app.use(express.json()); // this allows us to use req.body when making and getting requests

app.use(Router);

app.get("/", (req, res) => {
    res.send("hi");
    console.log('hi')
})

const KOVAN_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-kovan";

const KOVAN_URL = "https://eth-kovan.alchemyapi.io/v2/nl2PDNZm065-H3wMj2z1_mvGP81bLfqX";
const customHttpProvider = new ethers.providers.JsonRpcProvider(KOVAN_URL);
const dater = new EthDater(customHttpProvider);

//Note:  from and timestamp_gte should be variables
const superTokenTransferFromQuery = `
    query GetTransfers {
        transferEvents(where: {from: "0x9421fe8eccafad76c3a9ec8f9779fafa05a836b3"}) {
        token
        timestamp
        value
        transactionHash
        from {
          id
        }
        to {
          id
        }
       }   
    }`;

const superTokenTransferToQuery = `
    query GetTransfers {
        transferEvents(where: {to: "0x9421fe8eccafad76c3a9ec8f9779fafa05a836b3"}) {
        token
        timestamp
        value
        transactionHash
        from {
            id
        }
        to {
            id
        }
      }   
    }`;

    // date: Number,
    // sender: String,
    // recipient: String,
    // txHash: String,
    // networkId: String,
    // amountToken: String,
    // amountUSD: String,
    // token: {
    //     id: String, // address of token, 'native' if native asset
    //     symbol: String,
    //     name: String,
    //     underlyingAddress: String //address of underlying token if a super token, 0 if there isn't one in the case of erc20 or native assets
    // }

const getERC20FromData = async (tokenAddress, fromAddress, startTime, endTime) => {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, customHttpProvider);

    const filterFrom = tokenContract.filters.Transfer(fromAddress, null);

    let startBlockInfo = await dater.getDate(startTime * 1000);
    let endBlockInfo = await dater.getDate(endTime * 1000);

    const data = await tokenContract.queryFilter(filterFrom, startBlockInfo.block, endBlockInfo.block);

    // for (let i = 0; i < data.length; i++) {
    //     let blockInfo = await provider.getBlock(data[i].blockNumber);
    //     let timestamp = blockInfo.timestamp;
    //     let recipient = data[i].args[1];
    //     console.log("receiver: ", recipient)
    //     let txHash = data[i].transactionHash;
    //     // let networkId = "";
    //     let value = ethers.BigNumber.from(data[i].args[2]);
    //     console.log(value);
    //     let token_id = tokenAddress;
    //     let token_underlying = 0;

    // }

    console.log(`Transfer data from ${fromAddress}:`);

    return data;
}



const getERC20ToData = async (tokenAddress, toAddress, startTime, endTime) => {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, customHttpProvider);

    const filterTo = tokenContract.filters.Transfer(toAddress, null);

    let startBlockInfo = await dater.getDate(startTime * 1000);
    
    let endBlockInfo = await dater.getDate(endTime * 1000);

    const data = await tokenContract.queryFilter(filterTo, startBlockInfo.block, endBlockInfo.block);

    return data;
}

const getSuperTokenFromData = async (fromAddress) => {

    const superTokenTransferFromQuery = `
    query GetTransfers {
        transferEvents(where: {from: "${fromAddress}"}) {
        token
        timestamp
        value
        transactionHash
        from {
          id
        }
        to {
          id
        }
       }   
    }`;

    const client = new ApolloClient({
        link: new HttpLink({uri: KOVAN_SUBGRAPH_URL, fetch}),
        cache: new InMemoryCache()
    });
    
    const data = await client.query({
            query: gql(superTokenTransferFromQuery)
        });

    return data.data.transferEvents;
            
}

const getSuperTokenToData = async (toAddress) => {

    const superTokenTransferToQuery = `
    query GetTransfers {
        transferEvents(where: {to: "${toAddress}"}) {
        token
        timestamp
        value
        transactionHash
        from {
            id
        }
        to {
            id
        }
      }   
    }`;

    const client = new ApolloClient({
        link: new HttpLink({uri: KOVAN_SUBGRAPH_URL, fetch}),
        cache: new InMemoryCache()
    });
    
    const data = await client.query({
            query: gql(superTokenTransferToQuery)
        });

    return data.data.transferEvents;
}

const getStreamData = async (fromTime, toTime, accountAddress) => {
    let secondsToQuery = toTime - fromTime
    let daysToQuery = secondsToQuery / 86400; //get the number of days to query

    let startTimeTracker = fromTime;
    
    for (let i = 0; i < daysToQuery; i++) {
        //run query from start time tracker until startTimeTracker + 86400 > toTime 

    //imperfect for now bc not checking if startTimeTracker + 86400 < toTime
    //but this will get our streams that are open throughout this day
    const streamQuery = `query GetStreams {
        account(id: "${accountAddress}") {
            inflows(where: {currentFlowRate_gt: "0"}) {
              streamPeriods(
                where: {startedAtTimestamp_gte: "${fromTime}", stoppedAtTimestamp_lte: "${toTime}"}
              ) {
                flowRate
                totalAmountStreamed
                token {
                  name
                  symbol
                  id
                }
                startedAtTimestamp
                stoppedAtTimestamp
              }
              sender {
                  id
              }
              currentFlowRate
            }
            outflows(where: {currentFlowRate_gt: "0"}) {
              streamPeriods(
                where: {startedAtTimestamp_gte: "${fromTime}", stoppedAtTimestamp_lte: "${toTime}"}
              ) {
                flowRate
                totalAmountStreamed
                token {
                  name
                  symbol
                  id
                }
                startedAtTimestamp
                stoppedAtTimestamp
              }
              receiver {
                  id
              }
              currentFlowRate
            }
          }
  }`

  const client = new ApolloClient({
        link: new HttpLink({uri: KOVAN_SUBGRAPH_URL, fetch}),
        cache: new InMemoryCache()
    });

    const streamData = await client.query({
        query: gql(streamQuery)
    });

    return streamData.data;
        //run query and add tx to DB
    }

}

async function getData() {
    
    console.log("Get super token transfers for this address: ", "0x9421fe8eccafad76c3a9ec8f9779fafa05a836b3");
    const superTokenFromData = await getSuperTokenFromData("0x9421fe8eccafad76c3a9ec8f9779fafa05a836b3");
    const superTokenToData = await getSuperTokenToData("0x9421fe8eccafad76c3a9ec8f9779fafa05a836b3");

    // console.log(superTokenFromData[0]);
    // console.log(superTokenToData[0]);

    console.log("getting erc20 info for the following accounts: ")
    console.log("token address: 0xB64845D53a373D35160B72492818f0d2F51292c0");
    console.log("account address: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721");

    const erc20FromData = await getERC20FromData("0xB64845D53a373D35160B72492818f0d2F51292c0", "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721", 1641013201, 1655265601);
    const erc20ToData = await getERC20ToData("0xB64845D53a373D35160B72492818f0d2F51292c0", "0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721", 1641013201, 1655265601);

    // console.log(erc20FromData[0]);
    // console.log(erc20ToData[0]);

    const streamData = await getStreamData(1642261178, 1655307662, "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721");

    let timeInterval = 1655307662 - 1642261178;
    let dayInterval = timeInterval / 86400;
    let fullDays = Math.floor(dayInterval);
    let remainderDay = dayInterval - fullDays; //NOTE that this should be the absolute value... could be a negative number

    //calculation of amounts
    // for (let i = 0; i < streamData.account.inflows.length; i++) {
    //     if (streamData.account.inflows[i].streamPeriods.length == 0) {
    //         let streamedInFullDay = Number(streamData.account.inflows[i].currentFlowRate) * 86400;
    //         let remainderDayNumber;
    //         for (let j = 0; j < fullDays; j++) {
    //             console.log(`received on day ${j}: ${streamedInFullDay}`);
    //             remainderDayNumber = j;
    //         }
    //         let remainderAmount = remainderDay * (Number(streamData.account.inflows[i].currentFlowRate) / 86400);
    //         console.log(`remainder received amount on day ${remainderDayNumber + 1}: ${remainderAmount}`)
    //     }
    // }

    // for (let i = 0; i < streamData.account.outflows.length; i++) {
    //     if (streamData.account.outflows[i].streamPeriods.length == 0) {
    //         let streamedInFullDay = Number(streamData.account.outflows[i].currentFlowRate) * 86400;
    //         let remainderDayNumber;
    //         for (let j = 0; j < fullDays; j++) {
    //             console.log(`streamed on day ${j}: ${streamedInFullDay}`);
    //             remainderDayNumber = j;
    //         }
    //         let remainderAmount = remainderDay * (Number(streamData.account.outflows[i].currentFlowRate) / 86400);
    //         console.log(`remainder streamed amount on day ${remainderDayNumber + 1}: ${remainderAmount}`)
    //     }
    // }

    // for (let i = 0; i < streamData.account.inflows.length; i++) {
    //     if (streamData.account.outflows[i].streamPeriods.length > 0) {
    //         console.log(stream)
    //     }
    // }

    // console.log(streamData.account.outflows[1].streamPeriods)
    //total time = stopped at timestamp - started at timestamp
    // total amount streamed = total time x flow rate
    //day interval = total time / 86400
    // total full days = Math.floor (day interval / 86400)
    // total remainder time = absolute value of day interval - total full days
    //print the amount for each full day
    //print the remainder amount for final day
    //note: console logs can be replaced by actual insertions

    // console.log(streamData.account.outflows)

    // let startedAtTime;
    // let stoppedAtTime;
    // console.log('running streamperiod calcs')
    // for (let i = 0; i < streamData.account.outflows.length; i++) {
    //     if (streamData.account.outflows[i].streamPeriods.length > 0) {
    //         for (let j = 0; j < streamData.account.outflows[i].streamPeriods.length; j++) {
    //             startedAtTime = streamData.account.outflows[i].streamPeriods[j].startedAtTimestamp;
    //             stoppedAtTime = streamData.account.outflows[i].streamPeriods[j].stoppedAtTimestamp;
    //             let streamPeriodTimeInterval = stoppedAtTime - startedAtTime;
    //             let streamPeriodDayInterval = streamPeriodTimeInterval / 86400;
    //             let streamPeriodFullDays = Math.floor(streamPeriodDayInterval);
    //             let streamPeriodRemainderDay = streamPeriodDayInterval - streamPeriodFullDays;
    //             if ( streamPeriodFullDays == 0) {
    //                 streamPeriodRemainderDay * -1;
    //             } 
    //             console.log('length of stream in days: ', streamPeriodDayInterval)
    //             let streamedInFullPerDay = Number(streamData.account.outflows[i].streamPeriods[j].flowRate) * streamPeriodFullDays;
    //             let streamedInRemainderDay = streamPeriodRemainderDay * (Number(streamData.account.outflows[i].streamPeriods[j].flowRate) / 86400);
    //             let numberOfFullDays = 0;
    //             if (streamPeriodFullDays > 0) {
    //                 for (let k = 0; k < streamPeriodFullDays; k++) {
    //                     console.log(`streamed on day ${k}: ${streamedInFullPerDay}`);
    //                     numberOfFullDays++;
    //                 }
    //             }
                
    //             console.log(`streamed on final day: ${numberOfFullDays}: ${streamedInRemainderDay}`)
    //         }
    //     }
    // }


    // console.log(streamData.account.inflows);

}

async function dbConnection () {
    //connect to DB
    const dbUrl = process.env.DB_URL
    if (dbUrl === undefined) {
        throw Error('dotenv failed to load DB_URL')
    }
    Communicator.connectToDB(dbUrl);
}

dbConnection();



getData();




//ROUTES

// app.post("/add-internal-address", async (req, res) => {
//     try {

//         const newAddressBookRecord = await pool.query(
//             "INSERT INTO internal_accounts (account_owner, account_address, account_name) VALUES($1, $2, $3) RETURNING *",
//             [req.body.connectedAddress, req.body.accountAddress, req.body.accountName]);

//             console.log(newAddressBookRecord.rows)
//             console.log('run complete')
//     }
//     catch (err) {
//         console.error(err.message)
//     }
// });

module.exports = app;

//queries

//getting current outstanding outflows and inflows
// query MyQuery {
//     accounts(where: {id: "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721"}) {
//       id
//       outflows(where: {currentFlowRate_gt: "0"}) {
//         currentFlowRate
//         token {
//           symbol
//           id
//         }
//         receiver {
//           id
//         }
//       }
//       inflows(where: {currentFlowRate_gt: "0"}) {
//         currentFlowRate
//         token {
//           symbol
//           id
//         }
//         receiver {
//           id
//         }
//       }
//     }
//   }

//flow updated events... change timestamp to represent the last 24 hours
// query MyQuery {
//     flowUpdatedEvents(
//       where: {sender: "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721", type: 1, timestamp_gt: "0", timestamp_lt: "1000000000000000"}
//     ) {
//       timestamp
//       token
//       type
//       oldFlowRate
//       flowRate
//       transactionHash
//       totalAmountStreamedUntilTimestamp
//     }
//   }

//flow deleted events.. change timestamp to represent the last 24 hours
// query MyQuery {
//     flowUpdatedEvents(
//       where: {sender: "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721", type: 2, timestamp_gt: "0", timestamp_lt: "1000000000000000"}
//     ) {
//       timestamp
//       token
//       type
//       oldFlowRate
//       flowRate
//       transactionHash
//       totalAmountStreamedUntilTimestamp
//     }
//   }

//flow created events... change timestamp to represent the last 24 hours
// query MyQuery {
//     flowUpdatedEvents(
//       where: {sender: "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721", type: 1, timestamp_gt: "0", timestamp_lt: "1000000000000000"}
//     ) {
//       timestamp
//       token
//       type
//       oldFlowRate
//       flowRate
//       transactionHash
//       totalAmountStreamedUntilTimestamp
//     }
//   }

//logic
//need to check what flowUpdated events happened for a given account on the sender and receiver end in the last 24 hours

//if no events happened, then represent each outstanding stream individually as flowRate x 86400 - or the number of tokens sent or received in that 24 hour period
//for the above, if we note that no flowUpdated events happened for the stream between last xyz days, we could sum these values over longer time intervals

//if there are flow updated events for a given 24 hour period, sum the amount streamed between each streamPeriod that exists throughout the day
//in the case of a flow that is created at 8am, updated at 12pm, deleted at 5pm, then created again at 10pm
//get amount streamed between 8am and 12pm
//get amount streamed between 12pm and 5pm
//get amount streamed between 10pm and 12am


//using streamperiods which we can splice into individual days

// query MyQuery {
    // account(id: "0xdcb45e4f6762c3d7c61a00e96fb94adb7cf27721") {
    //   inflows(where: {currentFlowRate_gt: "0"}) {
    //     streamPeriods(
    //       where: {startedAtTimestamp_gte: "1642261178", stoppedAtTimestamp_lte: "1655307662"}
    //     ) {
    //       flowRate
    //       totalAmountStreamed
    //       token {
    //         name
    //         symbol
    //         id
    //       }
    //       startedAtTimestamp
    //       stoppedAtTimestamp
    //     }
    //     currentFlowRate
    //   }
    //   outflows(where: {currentFlowRate_gt: "0"}) {
    //     streamPeriods(
    //       where: {startedAtTimestamp_gte: "1642261178", stoppedAtTimestamp_lte: "1655307662"}
    //     ) {
    //       flowRate
    //       totalAmountStreamed
    //       token {
    //         name
    //         symbol
    //         id
    //       }
    //       startedAtTimestamp
    //       stoppedAtTimestamp
    //     }
    //     currentFlowRate
    //   }
    // }
//   }