const mysql = require('mysql2')
require('dotenv').config()
const boolCheck = require('../utils/bool-check')

// Set your configurations in .env file
const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: boolCheck(process.env.WAIT_CONNECTION),
    connectionLimit: process.env.CONNECTION_LIMIT,
    queueLimit: process.env.QUEUE_LIMIT,
    enableKeepAlive: boolCheck(process.env.KEEP_ALIVE),
    keepAliveInitialDelay: process.env.INITIAL_DELAY
})

const db = pool.promise()

module.exports = db