import { React, useState, useEffect } from "react";
import { Wallet } from "./Wallet";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import Button from '@mui/material/Button';
import { Grid } from "@mui/material";
import { AddressInput } from "./AddressInput";


const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {} // required
  });

export function Web3Setup() {

    const [walletConnected, setWalletConnected] = useState(false);
    const [web3ModalInstance, setWeb3ModalInstance] = useState("");
    const [connectedAddress, setConnectedAddress] = useState("");
    const [web3Provider, setWeb3Provider] = useState("");

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

    async function connectWallet() {
        try {
            const instance = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(instance);
            const accountList = await provider.listAccounts();
            const connectedAddress = accountList[0];
            console.log(accountList)
            setWalletConnected(true);
            setWeb3ModalInstance(instance);
            setConnectedAddress(connectedAddress);
            setWeb3Provider(web3Provider);
        } catch (err) {
            console.error(err)
        }
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

    //this function should write address to db
    async function addAccount(accountAddress) {
        console.log("adding account: ", accountAddress);
    }

    //this function should remove an account from db
    async function removeAccount(accountAddress) {
        console.log("removing account:")
    }


    return (
        <div>
        <Grid container spacing={2}>
            <Grid item xs={2}><h3>SF Logo</h3></Grid>
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
            </Grid>
        </Grid>
             
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <Button variant="contained">Get Transactions</Button>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4}><h2>Hello {`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(38, 42)}`}</h2></Grid>
        </Grid>
        <Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
                <AddressInput addAccount={addAccount}/>
            </Grid>
        </Grid>
        </div>

        
    )
}