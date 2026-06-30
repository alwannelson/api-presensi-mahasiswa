const db = require('../../configs/database')
const { get } = require('../../routes/router')
const boolCheck = require('../../utils/bool-check')
const deleteUploadedFile = require('../../utils/del-uploaded-file')
const currentDate = new Date()
const currentDateFormatted = currentDate.toISOString().split('T')[0]

exports.getToday = async function (req, res) {
    try {
        const student = req.user
        const today = currentDate.getDay()

        const [getCourses] = await db.execute(
            `
            SELECT
                s.id AS id_schedule,
                c.name AS class_name,
                c.location AS class_loc,
                co.name AS course_name,
                co.slug AS slug,
                co.credits AS course_credits,
                l.fullname AS lecturer_name,
                l.degree AS lecturer_degree,
                s.day AS day,
                s.major_code AS major,
                s.start_time AS start,
                s.end_time AS end,
            TIMEDIFF(s.end_time, s.start_time) AS durations,
            CASE 
                WHEN a.status = 1 THEN 'hadir'
                WHEN a.status = 0 THEN 'tidak_hadir'
                ELSE 'belum'
            END AS attendance_status,
                a.status AS attendance_value
            FROM schedules s
            JOIN classes c ON s.id_class = c.id
            JOIN courses co ON s.id_course = co.id
            JOIN lecturers l ON s.nid = l.nid
            JOIN course_regists cr ON s.id_course = cr.id_course AND cr.nim = ?
            LEFT JOIN attendance a ON s.id = a.id_schedule 
                AND a.nim = ? 
                AND DATE(a.date) = ?
            WHERE s.day = ?
                AND s.major_code = ?
                AND cr.nim = ?
            ORDER BY s.day, s.start_time`,
            [
                student.nim,
                student.nim,
                currentDateFormatted,
                today,
                student.major_code,
                student.nim
            ]
        )

        if (getCourses.length >= 1) {
            return res.status(200).json({
                status: 'success',
                message: 'Berikut daftar mata kuliah hari ini.',
                currentDateFormatted,
                data: { result: getCourses, length: getCourses.length }
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'Tidak ada jadwal kuliah hari ini.'
        })
    } catch (error) {
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}

exports.getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params
        const today = new Date().getDay()

        const [getCourseName] = await db.query(
            `SELECT name FROM courses WHERE slug = ?`, [slug]
        )

        if (getCourseName.length === 0) {
            return res.status(404).json(
                {
                    status: 'Not Found',
                    message: `Mata kuliah ${slug} tidak ditemukan.`
                }
            )
        }

        const [getSchedule] = await db.execute(
            `
            SELECT 
                s.id AS id_schedule,
                co.name AS course_name,
                l.fullname AS lecturer_name,
                l.degree,
                s.start_time,
                s.end_time,
                s.day AS day,
                co.slug AS slug,
                co.credits,
                c.name AS class_name
            FROM schedules s
            JOIN courses co ON s.id_course = co.id
            JOIN lecturers l ON s.nid = l.nid
            JOIN classes c ON s.id_class = c.id
            WHERE co.slug = ? AND s.day = ?
            `, [slug, today]
        )

        if (getSchedule.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: `Mata kuliah ${getCourseName[0].name} tidak tersedia hari ini.`
            })
        }

        res.status(200).json({
            status: 'success',
            message: `Berikut jadwal mata kuliah ${getSchedule[0].course_name} dengan ${getSchedule[0].lecturer_name}, ${getSchedule[0].degree}`,
            data: getSchedule[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}

exports.submitPresence = async function (req, res) {
    try {
        const { slug } = req.params
        const { id_schedule, latitude, status, longitude, location_address } = req.body
        console.log(slug)
        const attachment = req.file
        const student = req.user
        const isStatus = boolCheck(status)

        const today = new Date().getDay()
        const [getCourseName] = await db.query(
            `SELECT name FROM courses WHERE slug = ?`, [slug]
        )

        if (getCourseName.length === 0) {
            return res.status(404).json(
                {
                    status: 'Not Found',
                    message: `Mata kuliah ${slug} tidak ditemukan.`
                }
            )
        }

        const [getSchedule] = await db.execute(
            `
            SELECT 
                s.id AS id_schedule,
                co.name AS course_name,
                l.fullname AS lecturer_name,
                l.degree,
                s.start_time,
                s.end_time,
                s.day AS day,
                co.slug AS slug,
                co.credits,
                c.name AS class_name
            FROM schedules s
            JOIN courses co ON s.id_course = co.id
            JOIN lecturers l ON s.nid = l.nid
            JOIN classes c ON s.id_class = c.id
            WHERE co.slug = ? AND s.day = ?
            `, [slug, today]
        )

        if (getSchedule.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: `Mata kuliah ${getCourseName[0].name} tidak tersedia hari ini.`
            })
        }

        if (!id_schedule) {
            deleteUploadedFile(req)
            return res.status(400).json({
                status: 'Bad Request',
                message: 'ID jadwal harus disertakan.'
            })
        }

        if (!latitude || !longitude) {
            deleteUploadedFile(req)
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Koordinat lokasi harus disertakan.'
            })
        }

        let msg = ''
        if (isStatus) msg = 'Foto selfie'
        else msg = 'Dokumen pendukung'

        if (!attachment) {
            deleteUploadedFile(req)
            return res.status(400).json({
                status: 'Bad Request',
                message: `${msg} harus disertakan.`
            })
        }

        const photoPath = `/img/uploads/presence/${attachment.filename}`

        const [checkStatus] = await db.execute(
            `SELECT nim, location_address, attachment FROM attendance WHERE nim = ? AND date = ? AND id_schedule = ?`,
            [student.nim, currentDateFormatted, id_schedule]
        )

        if (checkStatus.length >= 1) {
            deleteUploadedFile(req)
            return res.status(409).json({
                status: 'Conflict',
                message: 'Presensi pada mata kuliah ini telah dilakukan sebelumnya.',
                data: {
                    nim: checkStatus[0].nim,
                    location_address: checkStatus[0].location_address,
                    attachment: checkStatus[0].attachment,
                    length: checkStatus.length
                }
            })
        }

        const [pushPresence] = await db.execute(
            `INSERT INTO attendance (id_schedule, nim, status, attachment, latitude, longitude, location_address, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_schedule, student.nim, isStatus, photoPath, latitude, longitude, location_address, currentDateFormatted]
        )

        if (pushPresence.affectedRows === 1) {
            return res.status(201).json({
                status: 'success',
                message: 'Presensi berhasil dikirim.',
                data: {
                    id: pushPresence.insertId,
                    photo: photoPath,
                    location: location_address,
                    coordinates: { latitude, longitude }
                }
            })
        } else {
            deleteUploadedFile(req)
            return res.status(500).json({
                status: 'Internal Server Error',
                message: 'Gagal menyimpan data presensi.'
            })
        }
    } catch (error) {
        deleteUploadedFile(req)
        console.log(error)
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}