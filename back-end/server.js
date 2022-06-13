const app = require("./app"); 
require("dotenv").config();



app.listen(5000, () => {
    console.log('server has started on port 5000');
})