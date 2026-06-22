const db = require('../../configs/database')
const bcrypt = require('bcrypt')

exports.getStudents = async function (req, res) {
    try {
        const { nim, major, fullname } = req.query;

        let sql = `SELECT * FROM students`;
        const conditions = [];
        const values = [];

        if (nim) {
            conditions.push(`nim LIKE ?`);
            values.push(`%${nim}%`);
        }

        if (major) {
            conditions.push(`major LIKE ?`);
            values.push(`%${major}%`);
        }

        if (fullname) {
            conditions.push(`fullname LIKE ?`);
            values.push(`%${fullname}%`);
        }

        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        sql += ` ORDER BY nim ASC`;

        const [students] = await db.execute(sql, values);

        if (students.length === 0) {
            return res.status(200).json({
                status: 'Success',
                message: 'Saat ini tidak ada data mahasiswa yang ditemukan.'
            });
        }

        const rows = students.map(({ id, ...rest }) => rest);

        return res.status(200).json({
            status: 'Success',
            message: 'Berikut data-data mahasiswa.',
            data: {
                result: rows,
                length: rows.length
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}

exports.newStudent = async function (req, res) {
    try {
        const { nim, fullname, password, major, email } = req.body
        const validMajor = ['SI', 'SK', 'MI']

        if (!nim || !fullname || !password || !major || !email) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Semua kolom wajib diisi.'
            })
        }

        if (!validMajor.includes(major)) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Jurusan tidak ditemukan. Harap masukkan kode jurusan yang valid.'
            })
        }

        const [nimCheck] = await db.execute(
            `SELECT fullname, major FROM students WHERE nim = ?`, [nim]
        )

        const [emailCheck] = await db.execute(
            `SELECT fullname, major FROM students WHERE email = ?`, [email]
        )

        if (nimCheck.length === 1) {
            return res.status(409).json({
                status: 'Conflict',
                message: `NIM ${nim} sudah digunakan oleh mahasiswa: ${nimCheck[0].fullname} dengan jurusan: ${nimCheck[0].major}.`
            })
        }

        if (emailCheck.length === 1) {
            return res.status(409).json({
                status: 'Conflict',
                message: `Email ${email} sudah digunakan oleh mahasiswa: ${emailCheck[0].fullname} dengan jurusan: ${emailCheck[0].major}.`
            })
        }

        const hashing = await bcrypt.hash(password, 12)

        const firstName = fullname.trim().split(/\s+/)[0];
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const username = `${firstName}!!${randomNum}`
        const [pushDataStudent] = await db.execute(
            `INSERT INTO students (nim, password, fullname, nickname, major, email, telephone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nim, hashing, fullname, username, major, email, '-', '-']
        )

        if (pushDataStudent.affectedRows > 0) {
            return res.status(201).json({
                status: 'Created',
                message: `${fullname} berhasil ditambahkan.`,
                data: {
                    fullname,
                    nim,
                    password,
                    major
                }
            })
        }
    } catch (error) {
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}