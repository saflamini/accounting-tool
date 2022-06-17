import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'address', headerName: 'Address', type: 'string', width: 400 },
  { field: 'name', headerName: 'Name', type: 'string', width: 300 },
];

function generateRows(addressBook) {
    let rowArray = [];
    for (let i = 0; i < addressBook.length; i++) {
        if (addressBook[i].name !== "") {
            rowArray.push({
                id: addressBook[i]._id, address: addressBook[i].address, name: addressBook[i].name
            })
        }
    }
    console.log(rowArray)
    return rowArray;
}

let rows = [];

export function AddressBook (connectedAddressBook) {

if (connectedAddressBook.connectedAddressBook) {
    const book  = connectedAddressBook.connectedAddressBook;
    rows = generateRows(book);
}


  return (
    <div style={{ height: 380, width: '150%', marginLeft: '-25%', marginTop: '3%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
