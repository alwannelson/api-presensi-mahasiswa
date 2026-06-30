const db = require('../../configs/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const boolCheck = require('../../utils/bool-check')
require('dotenv').config()

exports.postLogin = async function (req, res) {
    try {
        const { nid, password } = req.body

        if (!nid || !password) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'NID dan password dibutuhkan.'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Password tidak boleh kurang dari 6 karakter.'
            })
        }

        const [checkUser] = await db.query(
            `SELECT nid, fullname, nickname, gender, password, degree FROM lecturers WHERE nid = ?`, [nid]
        )

        if (checkUser.length === 0) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: `NID ${nid} tidak ditemukan. Harap masukkan nid dengan benar.`
            })
        }

        const verify = await bcrypt.compare(password, checkUser[0].password)
        const finalName = `${checkUser[0].fullname}, ${checkUser[0].degree}`

        if (!verify) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Password Anda salah. Silakan masukkan password yang benar!'
            })
        } else {
            const isGender = checkUser[0].gender
            
            let gender = ''
            if (isGender === 0) gender = 'Pria'
            else gender = 'Wanita'

            const payload = {
                nid: checkUser[0].nid,
                fullname: finalName,
                gender,
                is_gender: isGender,
                role: 'lecturer'
            }

            const token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: '3h'
            })

            res.cookie('token', token, {
                httpOnly: boolCheck(process.env.HTTP_ONLY),
                secure: boolCheck(process.env.SECURE),
                sameSite: process.env.SAME_SITE,
                maxAge: 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                status: 'success',
                message: `Hi, ${checkUser[0].nickname}. Anda berhasil login.`
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