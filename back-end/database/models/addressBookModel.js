const { model, Schema } = require("mongoose");

const addressBookSchema = new Schema({
    owner_address: {
        type: String,
        required: [true, "each address should be unique"],
        unique: [true, "each address should be unique"]
    },
    address_book: [
        {
            address: {
                type: String,
                required: [true, "each address in address book is required"],
                unique: [true, "Each address in address book must be unique"]
            },
            name: {
                type: String,
                unique: [true, "cannot have duplicate names in address book"]
            }
        }
    ]
});

//creates a new model for our mongodb
const addressBookModel = model('AddressBook', addressBookSchema);

module.exports = addressBookModel;