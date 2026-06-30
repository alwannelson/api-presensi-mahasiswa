const db = require('../../configs/database')
const bcrypt = require('bcrypt')

exports.getLecturers = async function (req, res) {
    try {
        const { nid, degree, fullname } = req.query;

        let sql = `SELECT * FROM lecturers`;
        const conditions = [];
        const values = [];

        if (nid) {
            conditions.push(`nid LIKE ?`);
            values.push(`%${nid}%`);
        }

        if (degree) {
            conditions.push(`degree LIKE ?`);
            values.push(`%${degree}%`);
        }

        if (fullname) {
            conditions.push(`fullname LIKE ?`);
            values.push(`%${fullname}%`);
        }

        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        sql += ` ORDER BY nid ASC`;

        const [students] = await db.execute(sql, values);

        if (students.length === 0) {
            return res.status(200).json({
                status: 'Success',
                message: 'Saat ini tidak ada data dosen yang ditemukan.'
            });
        }

        const rows = students.map(({ id, ...rest }) => rest);

        return res.status(200).json({
            status: 'Success',
            message: 'Berikut data-data dosen.',
            result: {
                rows,
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

exports.getLecturerCount = async function (req, res) {
    try {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) AS lecturer_count,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active,
                COUNT(CASE WHEN is_active = 0 THEN 1 END) AS deactive
            FROM lecturers`
        )
        const lecturerCount = rows[0].lecturer_count
        const active = rows[0].active
        const deactive = rows[0].deactive

        const activePercentage = ((active / lecturerCount) * 100).toFixed(2)
        const deactivePercentage = ((deactive / lecturerCount) * 100).toFixed(2)

        return res.status(200).json({
            status: 'success',
            message: 'Berikut jumlah dan persentase dosen.',
            result: {
                count: lecturerCount,
                active: {
                    count: active,
                    percentage: activePercentage
                },
                deactive: {
                    count: deactive,
                    percentage: deactivePercentage
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Terjadi kesalahan pada server.'
        })
    }
}

exports.newLecturer = async function (req, res) {
    try {
        const { nid, fullname, password, degree, email } = req.body

        if (!nid || !fullname || !password || !degree || !email) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Semua kolom wajib diisi.'
            })
        }

        if (!isNaN(degree)) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Kolom gelar harus berupa teks.'
            })
        }

        const [existingLecturer] = await db.execute('SELECT fullname FROM lecturers WHERE nid = ?', [nid])
        if (existingLecturer.length > 0) {
            return res.status(409).json({
                status: 'Conflict',
                message: `NID ${nid} telah terdaftar sebagai dosen dengan nama ${existingLecturer[0].fullname}.`
            })
        }

        const [existingEmail] = await db.execute('SELECT fullname FROM lecturers WHERE email = ?', [email])
        if (existingEmail.length > 0) {
            return res.status(409).json({
                status: 'Conflict',
                message: `Email ${email} telah terdaftar sebagai dosen dengan nama ${existingEmail[0].fullname}.`
            })
        }
        const hashed = await bcrypt.hash(password, 12)

        const [pushLecturer] = await db.execute(
            'INSERT INTO lecturers (nid, fullname, password, degree, status, email, telephone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nid, fullname, hashed, degree, 1, email, '-', '-']
        )

        return res.status(201).json({
            status: 'Created',
            message: 'Dosen baru berhasil ditambahkan.',
            data: {
                nid,
                fullname,
                degree,
                password,
                email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        });
    }
}