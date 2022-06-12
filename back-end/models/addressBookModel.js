const mongoose = require("mongoose");

const addressBookSchema = new mongoose.Schema({
    owner_address: {
      type: String,
      required: [true, "Each internal account must have owner"],
    },
    address_book: [
        {
            address: String,
            name: String
        }
    ]
});

//creates a new model for our mongodb
const addressBookModel = mongoose.model('AddressBook', addressBookSchema);
export default addressBookModel;