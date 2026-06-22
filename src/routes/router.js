const express = require('express')
const Router = express.Router()

const globalControllers = {
    logout: require('../controllers/logoutController')
}

const studentControllers = {
    login: require('../controllers/students/loginController'),
    courses: require('../controllers/students/coursesController'),
    today: require('../controllers/students/todayController')
}

const academicControllers = {
    login: require('../controllers/academic/loginController'),
    students: require('../controllers/academic/studentsController')
}

const middlewares = {
    tokenMiddleware: require('../middlewares/token-middleware'),
    roleMiddleware: require('../middlewares/role-middleware')
}

// Student's Routes
Router.post('/s/login', studentControllers.login.postLogin)

Router.get('/s/today',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.today.getToday)

Router.get('/s/courses',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.courses.getCourses)

Router.get('/s/today/present/:slug',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('student'),
    studentControllers.today.getCourseBySlug)

// Academic's Routes
Router.post('/a/login', academicControllers.login.postLogin)

Router.get('/a/students',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.students.getStudents
)

Router.post('/a/students/new-student',
    middlewares.tokenMiddleware.tokenCheck,
    middlewares.roleMiddleware('academic'),
    academicControllers.students.newStudent
)

// Global Routes 
Router.post('/logout', middlewares.tokenMiddleware.tokenCheck, globalControllers.logout.postLogout)

module.exports = Router