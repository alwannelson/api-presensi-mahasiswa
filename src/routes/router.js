/*
*****************************************=> Importer block starts here <=******************************************
*/

const express = require('express')
const { uploadMiddleware } = require('../middlewares/attachment-middleware')
const Router = express.Router()

const globalControllers = {
    logout: require('../controllers/logoutController')
}

const studentControllers = {
    login: require('../controllers/students/loginController'),
    courses: require('../controllers/students/coursesController'),
    today: require('../controllers/students/todayController')
}

const lecturerControllers = {
    login: require('../controllers/lecturer/loginController'),
    schedules: require('../controllers/lecturer/schedulesControllers')
}

const academicControllers = {
    login: require('../controllers/academic/loginController'),
    students: require('../controllers/academic/studentsController'),
    lecturers: require('../controllers/academic/lecturersController')
}

const middlewares = {
    tokenMiddleware: require('../middlewares/token-middleware'),
    roleMiddleware: require('../middlewares/role-middleware'),
    uploadMiddleware 
}

/*
*****************************************=> Importer block ends here <=******************************************
*/

// The best workers know when it's time to rest.

/*
*****************************************=> Student Routes start here <=******************************************
*/

Router.post('/s/login', studentControllers.login.postLogin)

Router.get('/s/today',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.today.getToday
)

Router.get('/s/courses',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.courses.getCourses
)

Router.get('/s/today/present/:slug',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.today.getCourseBySlug
)

Router.post('/s/today/present/:slug/submit',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    middlewares.uploadMiddleware,
    studentControllers.today.submitPresence
)

/*
*****************************************=> Student Routes end here <=******************************************
*/

// Work hard, but don't let work consume your life.

/*
*****************************************=> Lecturer Routes start here <=******************************************
*/

Router.post('/l/login',
    lecturerControllers.login.postLogin
)

Router.get('/l/schedules',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('lecturer'),
    lecturerControllers.schedules.getSchedules
)

/*
*****************************************=> Lecturer Routes end here <=******************************************
*/

// You are not a machine. Rest is part of the process.

/*
*****************************************=> Academic Routes start here <=******************************************
*/

Router.post('/a/login', academicControllers.login.postLogin)

Router.get('/a/students',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.students.getStudents
)

Router.get('/a/students/count',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.students.getStudentCount
)

Router.post('/a/students/new-student',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.students.newStudent
)

Router.get('/a/lecturers',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.lecturers.getLecturers
)

Router.get('/a/lecturers/count',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.lecturers.getLecturerCount
)

Router.post('/a/lecturers/new-lecturer',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.lecturers.newLecturer
)

/*
*****************************************=> Academic Routes end here <=******************************************
*/

// Global Routes 
Router.post('/logout', middlewares.tokenMiddleware.tokenCheck, globalControllers.logout.postLogout)

module.exports = Router