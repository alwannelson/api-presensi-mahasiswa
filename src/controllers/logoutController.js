const boolCheck = require('../utils/bool-check')
const db = require('../configs/database')
require('dotenv').config()

exports.postLogout = async function (req, res) {
    try {
        const userInfo = req.user
        const role = userInfo.role
    
        res.clearCookie('token', {
            httpOnly: boolCheck(process.env.HTTP_ONLY),
            secure: boolCheck(process.env.SECURE),
            sameSite: process.env.SAME_SITE
        })
    
        res.status(200).json({
            status: 'success',
            message: `Sampai jumpa ${userInfo.fullname}.`
        })
    } catch (error) {
        console.log(error)
    }
}