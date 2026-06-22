const db = require('../../configs/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const boolCheck = require('../../utils/bool-check')
require('dotenv').config()

exports.postLogin = async function (req, res) {
    try {
        const { nim, password } = req.body
        
        if (!nim || !password) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'NIM dan password dibutuhkan.'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Password tidak boleh kurang dari 6 karakter.'
            })
        }

        const [checkStudent] = await db.execute(
            `SELECT nim, fullname, nickname, major, password FROM students WHERE nim = ?`, [nim]
        )

        if (checkStudent.length === 0) {
            return res.status(404).json({
                status: 'Not Found',
                message: `NIM ${nim} tidak ditemukan. Harap masukkan NIM dengan benar!`
            })
        }
        
        const majorCode = checkStudent[0].major
        let major = ''
        
        if (majorCode === 'SI') {
            major = 'Sistem Informasi'
        } else if (majorCode === 'SK') {
            major = 'Sistem Komputer'
        } else {
            major = 'Manajemen Informatika'
        }

        const studentPassword = checkStudent[0].password
        const verifyPassword = await bcrypt.compare(password, studentPassword)

        if (verifyPassword) {
            const payload = {
                nim: checkStudent[0].nim,
                fullname: checkStudent[0].fullname,
                major_code: majorCode,
                major,
                role: 'student'
            }

            const token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: '2h'
            })

            res.cookie('token', token, {
                httpOnly: boolCheck(process.env.HTTP_ONLY),
                secure: boolCheck(process.env.SECURE),
                sameSite: process.env.SAME_SITE,
                maxAge: 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                status: 'Success',
                message: `Hai, ${checkStudent[0].nickname}. Anda berhasil login.`
            })
        } else {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Password Anda salah. Silakan masukkan password yang benar!'
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