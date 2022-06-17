import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export function DateSelector() {
  const [startValue, setStartValue] = React.useState(null);
  const [endValue, setEndValue] = React.useState(null);


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        sx={{'margin': '3%'}}
        label="Start"
        value={startValue}
        onChange={(newValue) => {
          setStartValue(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />

      <DatePicker
        // sx={{marginTop: '3%'}}
        label="End"
        value={endValue}
        onChange={(newValue) => {
          setEndValue(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
