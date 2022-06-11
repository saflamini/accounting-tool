import { React } from "react";
import Button from '@mui/material/Button';
import { Address } from "./Address";

export function Wallet(connectedWallet) {
console.log(connectedWallet)
    return (
    <div>
        {
            connectedWallet.connectedWallet === '' || undefined?
            <Button variant="contained">Connect Wallet</Button>
            :
            <Address addr={connectedWallet.connectedWallet}/>
        }
    </div>
    )
}

