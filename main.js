const express = require('express')
const app = express()
require('dotenv').config()
const router = require('./src/routes/router')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const cors = require('cors')
const boolCheck = require('./src/utils/bool-check')
const fs = require('fs')
const yaml = require('js-yaml')
const swaggerUi = require('swagger-ui-express')

const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, './src/docs/swagger.yaml'), 'utf8'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: boolCheck(process.env.CORS_CREDENTIALS)
}))
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, './src/public')))
app.use('/', router)
app.use('/', function (req, res) {
    return res.status(404).json({
        status: 'Not Found',
        message: 'Endpoint not found.'
    })
})

const port = process.env.APP_PORT || 3000
const appURL = process.env.APP_URL || 'http://localhost'

app.listen(port, function () {
    console.log('Bravo! Your application is running!')
    console.log(`${appURL}:${port}`)
} )