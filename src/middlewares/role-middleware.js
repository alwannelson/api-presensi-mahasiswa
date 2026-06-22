function roleCheck(role) {
    return function (req, res, next) {
        if (role !== req.user.role) {
            return res.status(403).json({
                status: 'Forbidden',
                message: 'Maaf, akses Anda ditolak karena kredensial Anda tidak sesuai.'
            })
        } else {
            next()
        }
    }
}

module.exports = roleCheck