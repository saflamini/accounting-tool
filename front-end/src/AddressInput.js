import { useState } from "react";
import React from "react";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import "./AddressInput.css";

export function AddressInput(props) {
    
    const [address, setAddress] = useState("");
    const [name, setName] = useState("")

    function handleAddressChange(e) {
        setAddress(() => ([e.target.name] = e.target.value));
    }

    function handleNameChange(e) {
        setName(() => ([e.target.name] = e.target.value))
    }

    async function addAddress(evt) {
        evt.preventDefault();        
        await props.addAddress(address, name);
        setAddress("");
        setName("");
    }
    
    return (
        <div>
            <TextField id="outlined-basic" sx={{"marginRight": '0.5%'}} label="Enter an address" variant="outlined" onChange={handleAddressChange}></TextField>
            <TextField id="outlined-basic" sx={{"marginRight": '0.5%'}} label="Enter a name for this address" variant="outlined" onChange={handleNameChange}></TextField>
            <Button sx={{"marginTop": '2%', 'height': '100%', 'backgroundColor': 'green'}} variant="contained" onClick={addAddress}>Add</Button>

        </div>
           
    )
}