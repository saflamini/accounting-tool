const request = require("supertest");
const app = require("./app");

const mockOwner = "0x3F047877e6613676d50Bf001b383682aDAeBE463";

describe(("Test get accounts path"), () => {

    test("it should return the correct status code", () => {
        return request(app)
            .get("/get-internal_accounts/:account-owner")
    })
} )