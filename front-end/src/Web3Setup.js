import { React, useState, useEffect } from "react";
import { Wallet } from "./Wallet";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import Button from '@mui/material/Button';
import { Grid, Modal, Dialog, TextField, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, Container } from "@mui/material";
import {FormControl, FormGroup, InputLabel, Select, MenuItem } from "@mui/material";
import { AddressInput } from "./AddressInput";
import { AddressBook } from "./AddressBook";
import { DateSelector } from "./DateSelector";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CSVLink } from "react-csv";
import "./sflogo.png";


const timeZoneConstants = {
    "0": "UTC + 00:00",
    "1": "CET + 1:00",
    "2": "EET + 2:00",
    "3": "EAT + 3:00",
    "3.5": "MET + 3:30",
    "4": "NET + 4:00",
    "5": "PLT + 5:00",
    "5.5": "IST + 5:30",
    "6": "BST + 6:00",
    "7": "VST + 7:00",
    "8": "CTT + 8:00",
    "9": "JST + 9:00",
    "9.5": "ACT + 9:30",
    "10": "AET + 10:00",
    "11": "SST + 11:00",
    "12": "NST + 12:00",
    "-11": "MIT - 11:00",
    "-10": "HST - 10:00",
    "-9": "AST - 9:00",
    "-8": "PST - 8:00",
    "-7": "MST - 7:00",
    "-6": "CST - 6:00",
    "-5": "EST - 5:00",
    "-4": "PRT - 4:00",
    "-3.5": "CNT - 3:30",
    "-3": "BET - 3:00",
}

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {} // required
  });

export function Web3Setup() {

    const [walletConnected, setWalletConnected] = useState(false);
    const [authDialog, showAuthDialog] = useState(false);
    const [walletAuthenticated, setWalletAuthenticated] = useState("");
    const [web3ModalInstance, setWeb3ModalInstance] = useState("");
    const [connectedAddress, setConnectedAddress] = useState("");
    const [web3Provider, setWeb3Provider] = useState("");
    const [timeZone, setTimeZone] = useState("UTC + 00:00");
    const [timeZoneNumber, setTimeZoneNumber] = useState(0);
    const [startValue, setStartValue] = useState(null);
    const [endValue, setEndValue] = useState(null);
    const [startNumberValue, setStartNumberValue] = useState(null);
    const [endNumberValue, setEndNumberValue] = useState(null);
    const [csvData, setCSVData] = useState([])

    useEffect(() => {
        if(web3Modal.cachedProvider) {
            connectWallet();
        }
    }, []);

    useEffect(() => {
        if(web3ModalInstance?.on) {
            const handleAccountsChanged = (accounts) => {
                console.log(accounts)
                disconnect();
                connectWallet();
                setConnectedAddress(accounts[0])
            }

            const handleChainChanged = (hexChainId) => {
                disconnect();
                connectWallet();
            }

            const handleDisconnect = () => {
                disconnect();
            }

            web3ModalInstance.on("accountsChanged", handleAccountsChanged);
            web3ModalInstance.on("chainChanged", handleChainChanged);
            web3ModalInstance.on("disconnect", handleDisconnect);

            return () => {
                if (web3ModalInstance.removeListener) {
                  web3ModalInstance.removeListener("accountsChanged", handleAccountsChanged);
                  web3ModalInstance.removeListener("chainChanged", handleChainChanged);
                  web3ModalInstance.removeListener("disconnect", handleDisconnect);
                }
              };
        }
    }, [web3ModalInstance]);

    async function getAuthenticatedAccount (connectedWallet) {
        try {
            const response = await fetch(`http://localhost:5000/get-address-book/${connectedWallet}`)
            const jsonData = await response.json();

            console.log(jsonData);
            if (jsonData === null) {
                console.log("not yet authenticated")
                return jsonData;
            } else {
                setWalletAuthenticated(jsonData);
                setTimeZone(timeZoneConstants[jsonData.owner_timezone_offset])
            }
            
            
        } catch (error) {
            console.log(error)
        }
    }

    async function getCSV() {
        try {
            console.log(startNumberValue.toString());
            console.log(endNumberValue.toString());
            console.log(connectedAddress)
            const response = await fetch(`http://localhost:5000/get-csv-data/${connectedAddress}/${startNumberValue.toString()}/${endNumberValue.toString()}`)
            const jsonData = await response.json();
            console.log(jsonData);
            setCSVData(jsonData);
            // return jsonData;

        
        } catch (error) {
            console.log(error)
        }
    }

    async function connectWallet() {
        try {
            const instance = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(instance);
            const accountList = await provider.listAccounts();
            const connectedAddress = accountList[0];
            setWalletConnected(true);
            setWeb3ModalInstance(instance);
            setConnectedAddress(connectedAddress);
            setWeb3Provider(web3Provider);
            console.log(connectedAddress)
            if (connectedAddress !== "" || connectedAddress !== undefined || connectedAddress !== null) {
                getAuthenticatedAccount(connectedAddress)
            }

        } catch (err) {
            console.error(err)
        }
    }

    function openAuthDialog() {
        showAuthDialog(true);
    }

    function closeAuthDialog() {
        showAuthDialog(false);
    }

    const handleDialogChange = (evt) => {
        setTimeZoneNumber(evt.target.value);
        setTimeZone(timeZoneConstants[evt.target.value.toString()])
    }

    const createNewAccount = async () => {
        try {
            const body = {
                owner_address: connectedAddress,
                owner_timezone_offset: timeZoneNumber,
                address_book: []
            }
            console.log(body)
            const response = await fetch("http://localhost:5000/add-account-owner", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.log(err);
        }
    }

    const dialogStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'white'
      };

     function displayAuthDialog() {
        return (
        <Dialog 
        style={dialogStyle}
        open={authDialog}
        onClose={closeAuthDialog}
        aria-labelledby="dialog-dialog-title"
        aria-describedby="dialog-dialog-description"
        >
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a time zone. This will be used for daily accounting.
          </DialogContentText>
          <FormControl fullWidth>
             <InputLabel id="demo-simple-select-label">Time Zone</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={timeZoneNumber}
            label="Time Zone"
            onChange={handleDialogChange}
            >
            <MenuItem value={0}>UTC + 00</MenuItem>
            <MenuItem value={1}>CET + 1:00</MenuItem>
            <MenuItem value={2}>EET + 2:00</MenuItem>
            <MenuItem value={3}>EAT + 3:00</MenuItem>
            <MenuItem value={3.5}>MET + 3:30</MenuItem>
            <MenuItem value={4}>NET + 4:00</MenuItem>
            <MenuItem value={5}>PLT + 5:00</MenuItem>
            <MenuItem value={5.5}>IST + 5:30</MenuItem>
            <MenuItem value={6}>BST + 6:00</MenuItem>
            <MenuItem value={7}>VST + 7:00</MenuItem>
            <MenuItem value={8}>CTT + 8:00</MenuItem>
            <MenuItem value={9}>JST + 9:00</MenuItem>
            <MenuItem value={9.5}>ACT + 9:30</MenuItem>
            <MenuItem value={10}>AET + 10:00</MenuItem>
            <MenuItem value={11}>SST + 11:00</MenuItem>
            <MenuItem value={12}>NST + 12:00</MenuItem>
            <MenuItem value={-11}>MIT - 11:00</MenuItem>
            <MenuItem value={-10}>HST - 10:00</MenuItem>
            <MenuItem value={-9}>AST - 9:00</MenuItem>
            <MenuItem value={-8}>PST - 8:00</MenuItem>
            <MenuItem value={-7}>MST - 7:00</MenuItem>
            <MenuItem value={-6}>CST - 6:00</MenuItem>
            <MenuItem value={-5}>EST - 5:00</MenuItem>
            <MenuItem value={-4}>PRT - 4:00</MenuItem>
            <MenuItem value={-3.5}>CNT - 3:30</MenuItem>
            <MenuItem value={-3}>BET - 3:00</MenuItem>
            </Select>
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAuthDialog}>Cancel</Button>
          <Button onClick={createNewAccount}>Select</Button>
        </DialogActions>
        </Dialog>
        )
    }

    function refreshState() {
        setWalletConnected(false);
        setWeb3ModalInstance("");
        setConnectedAddress("");
        setWeb3Provider("");     
    }

    async function disconnect() {
        await web3Modal.clearCachedProvider();
        refreshState();
    }

    async function addAddressToAddressBook(acctAddress, acctName) {
        const body = { acctAddress, acctName };

        console.log(JSON.stringify(body));
        
        const response = await fetch(`http://localhost:5000/add-internal-address/${walletAuthenticated.owner_address}`, {
            method: "PUT",
            mode: "cors",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        });

        getAuthenticatedAccount(connectedAddress);
        
    }

    //this function should remove an account from db
    async function removeAccount(accountAddress) {
        console.log("removing account:")
    }


    return (
        <div>
        <Grid container spacing={2}>
            <Grid item xs={2}><img src={require("./sflogo.png")} style={{height: '70%', width: '30%', marginBottom: '5%', marginLeft: '30%', marginTop: '2%'}} alt="superfluid logo"></img></Grid>
            <Grid item xs={8}></Grid>
            <Grid item xs={2}>
                <div>
                {
                    connectedAddress !== '' || undefined?
                    <h3>{`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(38, 42)}`}</h3>
                    :
                    <Button variant="contained" onClick={connectWallet}>Connect Wallet</Button>
                }
                </div>
                {
                    walletAuthenticated === false || walletAuthenticated === "" || walletAuthenticated === undefined || walletAuthenticated === null? 
                    <p><Button variant="contained" onClick={openAuthDialog}>Create Account</Button></p>
                    : <div>
                        <p>{timeZone}</p>
                    </div>
                }
                
            </Grid>
        </Grid>

             
        <Grid container spacing={2}>
            <Grid item xs={2} sx={{'marginLeft': '3%', 'padding': '1%'}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label="Start"
                value={startValue}
                onChange={(newValue) => {
                setStartValue(newValue)
                setStartNumberValue(newValue / 1000);
                }}
                
                renderInput={(params) => <TextField {...params} />}
            />

            <DatePicker
                label="End"
                value={endValue}
                onChange={(newValue) => {
                setEndValue(newValue);
                setEndNumberValue(newValue / 1000);
            }}
            renderInput={(params) => <TextField {...params} />}
            />
         </LocalizationProvider>
            <Button variant="contained" sx={{'backgroundColor': 'green', 'marginTop': '1%'}} onClick={getCSV}>Get Transactions</Button>
                <Button variant="contained" sx={{'backgroundColor': 'green', 'marginTop': '1%', 'color': 'white'}}>
                <CSVLink data={csvData}>
                    Download CSV
                </CSVLink>
                </Button>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4}>
                <h2>Hello {`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(38, 42)}`}</h2>
                <AddressInput addAddress={addAddressToAddressBook}/>
                {
                    walletAuthenticated !== "" || walletAuthenticated !== undefined || walletAuthenticated !== null? 
                        <AddressBook connectedAddressBook={walletAuthenticated.address_book}/>
                    :
                    <p>Add an address to see your address book</p>
                }
            </Grid>
        </Grid>
            
        {/* </Grid>
        <Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4}>
                <AddressInput addAddress={addAddressToAddressBook}/>
            </Grid>
        </Grid>
        {
        walletAuthenticated !== "" || walletAuthenticated !== undefined || walletAuthenticated !== null? 
        <Grid container spacing={2}>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
                <AddressBook connectedAddressBook={walletAuthenticated.address_book}/>
            </Grid>
        </Grid>
        :
        <p>Add an address to see your address book</p>
        } */}

        <Container>
            {showAuthDialog? displayAuthDialog() : console.log(`All set`)}
        </Container>
        
        </div>

    )
}