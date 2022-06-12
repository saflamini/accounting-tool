const app = require("./app"); 
const mongoose = require("mongoose");
require("dotenv").config();

const DB = process.env.MONGODB;

mongoose.connect(DB).then(() => {
    console.log("DB is connected")
});



app.listen(5000, () => {
    console.log('server has started on port 5000');
})