import { React } from "react";

export function Address(addr) {
    console.log(addr)
    return (
        <div>
            <h2>{addr.addr}</h2>
        </div>
    )
}