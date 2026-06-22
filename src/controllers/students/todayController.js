const db = require('../../configs/database')
const { get } = require('../../routes/router')

exports.getToday = async function (req, res) {
    try {
        const student = req.user
        const currentDate = new Date()
        const today = currentDate.getDay()
        const currentDateFormatted = currentDate.toISOString().split('T')[0]

        const [getCourses] = await db.execute(
            `SELECT
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
                    LEFT JOIN attendance a ON s.id = a.id_schedule 
                    AND a.nim = ? 
                    AND DATE(a.date) = ?
                    WHERE s.day = ?
                    AND s.major_code = ?
                    ORDER BY s.day, s.start_time
                    `, [student.nim, currentDateFormatted, today, student.major_code]
        )

        if (getCourses.length >= 1) {
            return res.status(200).json({
                status: 'success',
                message: 'Berikut daftar mata kuliah hari ini.',
                currentDateFormatted,
                data: getCourses
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
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Maaf, terjadi kesalahan pada server.'
        })
    }
}