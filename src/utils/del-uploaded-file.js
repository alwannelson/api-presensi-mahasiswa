const fs = require('fs')

function deleteUploadedFile(req) {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.log(err)
        })
    }
}

module.exports = deleteUploadedFile