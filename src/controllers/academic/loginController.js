const db = require('../../configs/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const boolCheck = require('../../utils/bool-check')
require('dotenv').config()

exports.postLogin = async function (req, res) {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Username dan password dibutuhkan.'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Password tidak boleh kurang dari 6 karakter.'
            })
        }

        const [checkUser] = await db.query(
            `SELECT username, nip, fullname, password, gender, position FROM academic WHERE username = ?`, [username]
        )

        if (checkUser.length === 0) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Username tidak ditemukan. Harap masukkan username dengan benar.'
            })
        }

        const verify = await bcrypt.compare(password, checkUser[0].password)

        if (!verify) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Password Anda salah. Silakan masukkan password yang benar!'
            })
        } else {
            const payload = {
                nip: checkUser[0].nip,
                fullname: checkUser[0].fullname,
                gender: checkUser[0].gender,
                position: checkUser[0].position,
                role: 'academic'
            }

            const token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: '1d'
            })

            res.cookie('token', token, {
                httpOnly: boolCheck(process.env.HTTP_ONLY),
                secure: boolCheck(process.env.SECURE),
                sameSite: process.env.SAME_SITE,
                maxAge: 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                status: 'success',
                message: `Hi, ${checkUser[0].username}. Anda berhasil login.`
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}