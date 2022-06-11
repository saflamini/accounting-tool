import { useState } from "react";
import React from "react";
import { TextField } from "@mui/material";
import { Button
 } from "@mui/material";

export function AddressInput(props) {
    
    const [address, setAddress] = useState("");

    function handleAddressChange(e) {
        setAddress(() => ([e.target.name] = e.target.value));
    }

    async function addAddress(evt) {
        evt.preventDefault();        
        await props.addAccount(address);
        setAddress("");
    }
    
    return (
        <div>
            <TextField id="outlined-basic" label="Enter an address" variant="outlined" onChange={handleAddressChange}></TextField>
            <Button className="addButton" variant="contained" onClick={addAddress}>Add</Button>

        </div>
           
    )
}