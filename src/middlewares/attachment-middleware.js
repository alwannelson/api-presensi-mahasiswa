const multer = require('multer')
const path = require('path')
const fs = require('fs')


const uploadDir = './src/public/img/uploads/presence'


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}


const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase()
}


const getMimeType = (mimetype) => {
    const mimeTypes = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'text/plain': '.txt',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png'
    }
    return mimeTypes[mimetype] || null
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const now = new Date()
        const uniqueSuffix = now.getDay() + '-' + Math.round(Math.random() * 1E9)
        const nim = req.user?.nim


        let ext = getMimeType(file.mimetype)
        if (!ext) {
            ext = getFileExtension(file.originalname)
        }

        cb(null, `${nim}-${uniqueSuffix}${ext}`)
    }
})


const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [

        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',

        'image/jpeg',
        'image/jpg',
        'image/png'
    ]


    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']


    const isValidMime = allowedMimeTypes.includes(file.mimetype)


    const ext = getFileExtension(file.originalname)
    const isValidExt = allowedExtensions.includes(ext)


    const maxSize = 2 * 1024 * 1024
    let isSizeValid = true
    if (file.size > maxSize) {
        isSizeValid = false
    }


    let isMatch = false
    if (file.mimetype === 'application/pdf' && ext === '.pdf') isMatch = true
    else if (file.mimetype === 'application/msword' && ext === '.doc') isMatch = true
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && ext === '.docx') isMatch = true
    else if (file.mimetype === 'text/plain' && ext === '.txt') isMatch = true
    else if ((file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') && (ext === '.jpg' || ext === '.jpeg')) isMatch = true
    else if (file.mimetype === 'image/png' && ext === '.png') isMatch = true


    if (!isValidMime) {
        cb(new Error(`Tipe file ${file.mimetype} tidak diizinkan. Hanya PDF, DOC, DOCX, TXT, JPG, JPEG, dan PNG yang diperbolehkan.`), false)
    } else if (!isValidExt) {
        cb(new Error(`Ekstensi file ${ext} tidak diizinkan. Hanya .pdf, .doc, .docx, .txt, .jpg, .jpeg, dan .png yang diperbolehkan.`), false)
    } else if (!isMatch) {
        cb(new Error(`MIME type (${file.mimetype}) tidak sesuai dengan ekstensi file (${ext}).`), false)
    } else if (!isSizeValid) {
        cb(new Error(`Ukuran file terlalu besar. Maksimal 2MB untuk dokumen yang di-upload.`), false)
    } else {
        cb(null, true)
    }
}


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 5
    },
    fileFilter
})


const uploadMiddleware = (req, res, next) => {
    upload.single('attachment')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            switch (err.code) {
                case 'FILE_TOO_LARGE':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Ukuran file terlalu besar. Maksimal 2MB.'
                    })

                case 'LIMIT_FILE_SIZE':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Ukuran file melebihi batas maksimum yang diizinkan yaitu 2MB.'
                    })

                case 'LIMIT_FILE_COUNT':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Jumlah file melebihi batas maksimum yang diizinkan.'
                    })

                case 'LIMIT_UNEXPECTED_FILE':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Field file tidak sesuai atau terlalu banyak file yang diunggah.'
                    })

                case 'LIMIT_PART_COUNT':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Terlalu banyak bagian (parts) dalam multipart form.'
                    })

                case 'LIMIT_FIELD_KEY':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Nama field melebihi batas maksimum panjang karakter.'
                    })

                case 'LIMIT_FIELD_VALUE':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Nilai field melebihi batas maksimum panjang karakter.'
                    })

                case 'LIMIT_FIELD_COUNT':
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: 'Jumlah field melebihi batas maksimum yang diizinkan.'
                    })

                default:
                    return res.status(400).json({
                        status: 'Bad Request',
                        message: `Terjadi kesalahan saat mengunggah file: ${err.message}`
                    })
            }
        } else if (err) {
            const errorMessage = err.message || 'Terjadi kesalahan yang tidak diketahui saat mengunggah file.'

            if (errorMessage.toLowerCase().includes('hanya') ||
                errorMessage.toLowerCase().includes('diperbolehkan') ||
                errorMessage.toLowerCase().includes('format')) {
                return res.status(400).json({
                    status: 'Bad Request',
                    message: errorMessage
                })
            }

            return res.status(400).json({
                status: 'Bad Request',
                message: errorMessage
            })
        }
        next()
    })
}


module.exports = {
    upload,
    uploadMiddleware,

    config: {
        uploadDir,
        allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ],
        allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
        maxFileSize: 2 * 1024 * 1024
    }
}