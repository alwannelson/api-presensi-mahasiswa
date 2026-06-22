const db = require('../../configs/database')

exports.getCourses = async function (req, res) {
    try {
        const studentInfo = req.user
        const majorCode = studentInfo.major_code
    
        const [rows] = await db.execute(
            `SELECT * FROM courses WHERE type LIKE ? ORDER BY name ASC`, [`%${majorCode}%`]
        )

        const getCourses = rows.map(({ id, ...rest }) => rest)

        const getSemester = rows[0].semester
        let strSemester = ''

        if (getSemester % 2 === 0) {
            strSemester = 'genap'
        } else {
            strSemester = 'ganjil'
        }
    
        if (rows.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: `Tidak ada mata kuliah Anda di semester ${strSemester}`
            })
        }

        res.status(200).json({
            status: 'success',
            message: `Berikut daftar mata kuliah Anda di semester ${strSemester}`,
            data: getCourses
        })
    } catch (error) {
        res.send(error)
    }
}