# API Presensi Online Mahasiswa Jayanusa Padang

Aplikasi ini adalah backend API untuk presensi online mahasiswa Jayanusa Padang.
API dibuat dengan **Express.js** dan **MySQL**, dan dilengkapi dengan dokumentasi API melalui **Swagger UI**.
Aplikasi ini didesain untuk mendukung frontend **React** dan sudah disiapkan agar mendukung upload multipart menggunakan `multer`.

## Descriptions

- Bahasa:
  - Backend API untuk sistem presensi online mahasiswa Jayanusa Padang.
  - Dilengkapi dengan dokumentasi Swagger UI.
  - Siap digunakan bersama frontend React.

- English:
  - Backend API for the online attendance system of Jayanusa Padang students.
  - Includes Swagger UI documentation.
  - Ready to be used with a React frontend.

## Feature

- API presensi online untuk mahasiswa
- Dokumentasi API dengan Swagger UI di `/api-docs`
- Mendukung multipart upload dengan `multer`
- Session dan cookie handling
- Konfigurasi CORS
- Koneksi MySQL dengan environment variable

## Project Structure

```bash
api-presensi/
│
├── src/
│   ├── configs/         # konfigurasi database
│   ├── controllers/     # logika endpoint
│   ├── middlewares/     # middleware autentikasi dan role
│   ├── routes/          # definisi route
│   ├── utils/           # utilitas helper
│   └── docs/            # dokumentasi Swagger OpenAPI
├── .env
├── main.js
├── package.json
├── package-lock.json
└── README.md
```

## Installations

1. Clone repository:

```bash
git clone <repository-url>
```

2. Masuk ke folder project:

```bash
cd api-presensi
```

3. Install dependency:

```bash
npm install
```

4. Jalankan aplikasi:

```bash
npm run dev
```

## Swagger UI

Dokumentasi Swagger tersedia di:

```text
http://localhost:6767/api-docs
```

OpenAPI definition tersedia di `src/docs/swagger.yaml`.

## Author

- GitHub: https://github.com/alwannelson
- Instagram: https://instagram.com/awannaditia
