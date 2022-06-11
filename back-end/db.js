const Pool = require("pg").Pool();

const pool = new Pool({
    user: "sam_flamini",
    host: "localhost",
    port: 5434,
    database: "accounting_tool"
});

module.exports = pool;