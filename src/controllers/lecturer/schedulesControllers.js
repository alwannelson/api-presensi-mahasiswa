const db = require('../../configs/database')

exports.getSchedules = async function (req, res) {
    try {
        const userInfo = req.user

        const [getSchedules] = await db.execute(
            `SELECT 
                sc.id AS id_schedule,
                sc.nid,
                sc.day,
                sc.major_code,
                sc.start_time,
                sc.end_time,
                co.name AS course_name,
                co.slug,
                co.credits,
                co.semester,
                c.name AS class_name,
                COUNT(DISTINCT a.nim) AS total_attendance, 
                SUM(CASE WHEN a.status = TRUE THEN 1 ELSE 0 END) AS total_present,
                SUM(CASE WHEN a.status = FALSE THEN 1 ELSE 0 END) AS total_absent  
            FROM schedules sc
            JOIN classes c ON sc.id_class = c.id
            JOIN courses co ON sc.id_course = co.id
            LEFT JOIN attendance a ON sc.id = a.id_schedule
            WHERE sc.nid = ?
            GROUP BY 
                sc.id,
                sc.nid,
                sc.day,
                sc.major_code,
                sc.start_time,
                sc.end_time,
                co.name,
                co.slug,
                co.credits,
                co.semester,
                c.name
            ORDER BY sc.start_time ASC`, [userInfo.nid]
        )

        if (getSchedules.length >= 1) {
            return res.status(200).json({
                status: 'success',
                message: 'Berikut daftar semua jadwal.',
                data: {
                    result: getSchedules,
                    length: getSchedules.length
                }
            })
        } else {
            return res.status(200).json({
                status: 'success',
                message: 'Anda tidak memiliki jadwal mengajar.'
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 'Internal Server Error',
            message: 'Telah terjadi kesalahan pada server.'
        })
    }
}