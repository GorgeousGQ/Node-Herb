const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    // password: 'StTnrKEAXFxf2HJD',
    password: '123456',
    database: 'my_db_07'
})

module.exports = db