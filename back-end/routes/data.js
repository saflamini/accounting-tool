const Communicator = require("../database/dbCommunicator");
require("dotenv").config();

const ethers = require("ethers");
const EthDater = require('ethereum-block-by-date');
const KOVAN_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-kovan";
const ERC20ABI = require("../abis/ERC20ABI");
const fetch = require("cross-fetch");
const  http =  require('http');
const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client/core');


const KOVAN_URL = "https://eth-kovan.alchemyapi.io/v2/nl2PDNZm065-H3wMj2z1_mvGP81bLfqX";
const customHttpProvider = new ethers.providers.JsonRpcProvider(KOVAN_URL);
const dater = new EthDater(customHttpProvider);


    const getERC20ToData = async (tokenAddress, toAddress, startTime, endTime) => {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, customHttpProvider);
    
        const filterTo = tokenContract.filters.Transfer(toAddress, null);
    
        let startBlockInfo = await dater.getDate(startTime * 1000);
        
        let endBlockInfo = await dater.getDate(endTime * 1000);
    
        const data = await tokenContract.queryFilter(filterTo, startBlockInfo.block, endBlockInfo.block);
    
        return data;
    }

    const getERC20FromData = async (tokenAddress, fromAddress, startTime, endTime) => {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, customHttpProvider);
    
        const filterFrom = tokenContract.filters.Transfer(fromAddress, null);
    
        let startBlockInfo = await dater.getDate(startTime * 1000);
        let endBlockInfo = await dater.getDate(endTime * 1000);
    
        const data = await tokenContract.queryFilter(filterFrom, startBlockInfo.block, endBlockInfo.block);
    
        console.log(`Transfer data from ${fromAddress}:`);
    
        return data;
    }

    const getSuperTokenFromData = async (fromAddress, token, startTime, endTime) => {

        const superTokenTransferFromQuery = `
        query GetTransfers {
            transferEvents(where: {from: "${fromAddress.toLowerCase()}", token: "${token.toLowerCase()}", to_not: "0x0000000000000000000000000000000000000000", timestamp_gt: "${startTime}", timestamp_lt: "${endTime}"}first: 10) {
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
    
        console.log("transfer froms")
        return data.data.transferEvents;
                
    }

    const getSuperTokenToData = async (toAddress, token, startTime, endTime) => {

        console.log(toAddress);
        console.log(token);
        console.log(startTime);
        console.log(endTime)
        const superTokenTransferToQuery = `
        query GetTransfers {
            transferEvents(where: {to: "${toAddress.toLowerCase()}", token: "${token.toLowerCase()}", from_not: "0x0000000000000000000000000000000000000000", timestamp_gt: "${startTime}", timestamp_lt: "${endTime}"}, first: 10) {
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
    
        console.log("transfer tos")
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

    const getStreams = async (address, token, startTime, endTime) => {
    
    
        const streamData = await getStreamData(startTime, endTime, address);
    
        if (streamData.account !== null && streamData.account !== undefined) {
            console.log(streamData.account.inflows);
            console.log(streamData.account.outflows);
        }

    //     let timeInterval = startTime - endTime;
    //     let dayInterval = timeInterval / 86400;
    //     let fullDays = Math.floor(dayInterval);
    //     let remainderDay = dayInterval - fullDays; //NOTE that this should be the absolute value... could be a negative number
    
    //     //calculation of amounts
    //     if (streamData.account !== null) {
    //         for (let i = 0; i < streamData.account.inflows.length; i++) {
    //             if (streamData.account.inflows[i].streamPeriods.length == 0) {
    //                 let streamedInFullDay = Number(streamData.account.inflows[i].currentFlowRate) * 86400;
    //                 let remainderDayNumber;
    //                 for (let j = 0; j < fullDays; j++) {
    //                     console.log(`received on day ${j}: ${streamedInFullDay}`);
    //                     remainderDayNumber = j;
    //                 }
    //                 let remainderAmount = remainderDay * (Number(streamData.account.inflows[i].currentFlowRate) / 86400);
    //                 console.log(`remainder received amount on day ${remainderDayNumber + 1}: ${remainderAmount}`)
    //             }
    //         }
    //     }

    // if (streamData.account !== null) {
    //     for (let i = 0; i < streamData.account.outflows.length; i++) {
    //         if (streamData.account.outflows[i].streamPeriods.length == 0) {
    //             let streamedInFullDay = Number(streamData.account.outflows[i].currentFlowRate) * 86400;
    //             let remainderDayNumber;
    //             for (let j = 0; j < fullDays; j++) {
    //                 console.log(`streamed on day ${j}: ${streamedInFullDay}`);
    //                 remainderDayNumber = j;
    //             }
    //             let remainderAmount = remainderDay * (Number(streamData.account.outflows[i].currentFlowRate) / 86400);
    //             console.log(`remainder streamed amount on day ${remainderDayNumber + 1}: ${remainderAmount}`)
    //         }
    //     }
    // }
    
    // if (streamData.account !== null) {
    //     for (let i = 0; i < streamData.account.inflows.length; i++) {
    //         if (streamData.account.outflows[i].streamPeriods.length > 0) {
    //             console.log(stream)
    //         }
    //     }
    // }
    
    //     // console.log(streamData.account.outflows[1].streamPeriods)
    //     //total time = stopped at timestamp - started at timestamp
    //     // total amount streamed = total time x flow rate
    //     //day interval = total time / 86400
    //     // total full days = Math.floor (day interval / 86400)
    //     // total remainder time = absolute value of day interval - total full days
    //     //print the amount for each full day
    //     //print the remainder amount for final day
    //     //note: console logs can be replaced by actual insertions
    
    //     console.log(streamData)
    
    //     let startedAtTime;
    //     let stoppedAtTime;
    //     console.log('running streamperiod calcs')
    //     if (streamData.account !== null) {
    //     for (let i = 0; i < streamData.account.outflows.length; i++) {
    //         if (streamData.account.outflows[i].streamPeriods.length > 0) {
    //             for (let j = 0; j < streamData.account.outflows[i].streamPeriods.length; j++) {
    //                 startedAtTime = streamData.account.outflows[i].streamPeriods[j].startedAtTimestamp;
    //                 stoppedAtTime = streamData.account.outflows[i].streamPeriods[j].stoppedAtTimestamp;
    //                 let streamPeriodTimeInterval = stoppedAtTime - startedAtTime;
    //                 let streamPeriodDayInterval = streamPeriodTimeInterval / 86400;
    //                 let streamPeriodFullDays = Math.floor(streamPeriodDayInterval);
    //                 let streamPeriodRemainderDay = streamPeriodDayInterval - streamPeriodFullDays;
    //                 if ( streamPeriodFullDays == 0) {
    //                     streamPeriodRemainderDay * -1;
    //                 } 
    //                 console.log('length of stream in days: ', streamPeriodDayInterval)
    //                 let streamedInFullPerDay = Number(streamData.account.outflows[i].streamPeriods[j].flowRate) * streamPeriodFullDays;
    //                 let streamedInRemainderDay = streamPeriodRemainderDay * (Number(streamData.account.outflows[i].streamPeriods[j].flowRate) / 86400);
    //                 let numberOfFullDays = 0;
    //                 if (streamPeriodFullDays > 0) {
    //                     for (let k = 0; k < streamPeriodFullDays; k++) {
    //                         console.log(`streamed on day ${k}: ${streamedInFullPerDay}`);
    //                         numberOfFullDays++;
    //                     }
    //                 }
                    
    //                 console.log(`streamed on final day: ${numberOfFullDays}: ${streamedInRemainderDay}`)
    //             }
    //         }
    //     }
    // }
    
    
    //     console.log(streamData.account.inflows);
    
    }

const getCSVData = async (connectedAddress, addressBook, startTime, endTime) => {
    //hard coded for kovan
    //hard coded for daix and dai
    let erc20FromData;
    let erc20ToData;
    let superTokenFromData;
    let superTokenToData;
    let streamInfo;
    let accounts = [connectedAddress];
    let csvRecord = [];

    for (let i = 0; i < addressBook.length; i++) {
        if (accounts[i] !== undefined) {
            accounts.push(addressBook[i]);
        }
    }

    console.log(accounts)
    try {
        for (let i = 0; i < accounts.length; i++) {
            console.log("PROCESSING FOR: ", accounts[i])
            erc20ToData = await getERC20ToData("0xB64845D53a373D35160B72492818f0d2F51292c0", accounts[i], startTime, endTime);
            erc20FromData = await getERC20FromData("0xB64845D53a373D35160B72492818f0d2F51292c0", accounts[i], startTime, endTime);
            superTokenToData = await getSuperTokenToData(accounts[i], "0xe3cb950cb164a31c66e32c320a800d477019dcff", startTime, endTime);
            superTokenFromData = await getSuperTokenFromData(accounts[i], "0xe3cb950cb164a31c66e32c320a800d477019dcff", startTime, endTime);
            streamInfo = await getStreams(accounts[i], "0xe3cb950cb164a31c66e32c320a800d477019dcff", startTime, endTime);

            console.log(erc20ToData);
            let internalStatus;
            for (let j = 0; j < erc20ToData.length; j++) {
                csvRecord.push({
                    date: erc20ToData[j].blockNumber, from: erc20ToData[j].args[0], value: erc20ToData[j].args[2].toString(), to: erc20ToData[j].args[1], type: "transfer", internal: false, network: 'kovan', link: `https://kovan.etherscan.io/tx/${erc20ToData[j].transactionHash}`
                })
            }
            
            console.log(erc20FromData);
            for (let k = 0; k < erc20FromData.length; k++) {
                csvRecord.push({
                    date: erc20FromData[k].blockNumber, from: erc20FromData[k].args[0], value: erc20ToData[k].args[2].toString(), to: erc20FromData[k].args[1], type: "transfer", internal: false, network: 'kovan', link: `https://kovan.etherscan.io/tx/${erc20FromData[k].transactionHash}`
                })
            }

            console.log(superTokenToData);
            if (superTokenToData !== null || superTokenToData !== undefined) {
                for (let l = 0; l < superTokenToData.length; l++) {
                    csvRecord.push({
                        date: superTokenToData[l].timestamp, from: superTokenToData[l].from.id, value: superTokenToData[l].value, to: superTokenToData[l].to.id, type: "transfer", internal: false, network: 'kovan', link: `https://kovan.etherscan.io/tx/${superTokenToData[l].transactionHash}`
                    })
                }
            }


            console.log(superTokenFromData);
            if (superTokenFromData !== null || superTokenFromData !== undefined) {
                for (let m = 0; m < superTokenFromData.length; m++) {
                    csvRecord.push({
                        date: superTokenFromData[m].timestamp, from: superTokenFromData[m].from.id, value: superTokenFromData[m].value, to: superTokenFromData[m].to.id, type: "transfer", internal: false, network: 'kovan', link: `https://kovan.etherscan.io/tx/${superTokenFromData[m].transactionHash}`
                    })
                }
            }

            // console.log(superTokenFromData);
            // console.log(streamInfo);
            console.log(csvRecord)
            return csvRecord;
            // returnedAccounts.push({date: `${}`, from: `${}`, to: `${}`, amount: `${}`, token: `${}`, type: `${}`, internal: `${}`, network: `kovan`, link: `https://kovan.etherscan.io/tx/${}`})
            // returnedAccounts.push(accountData);
        }
        // return returnedAccounts;

    } catch (err) {

        console.log("there was an error!")
        console.log(err);
    }
}

const getCSV = async (accounts, startTime, endTime) => {
    try {
        console.log("number of days queried: ", (endTime - startTime) / 86400);
        const allAccountData = await getData(accounts);
        //get all streams for the time period
        //get all erc20 transfers from for the time period
        //get all erc20 transfers to for the time period
        //get all super token transfers for the time period
        //if they don't exist yet in the DB, run a query to get them and add them to the database. then spit them out here too.
        //generate rows of CSV for the time period requested
    } catch (err) {
        console.log("there was an error!");
        console.log(err);
    }
}

const dataActions = {
    getCSVData
}

module.exports = dataActions;