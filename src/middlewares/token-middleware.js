const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretKey = process.env.SECRET_KEY

exports.tokenCheck = function (req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Sesi tidak ditemukan. Silakan login terlebih dahulu.'
            })
        }

        const decoded = jwt.verify(token, secretKey)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({
            status: 'Unauthorized',
            message: 'Sesi anda telah berakhir. Harap login ulang.'
        })
    }
}