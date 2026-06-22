# Express.js MySQL REST API Starter Pack

Starter pack microframework **Express.js** dengan konfigurasi database **mysql**. Cocok digunakan untuk projek REST API.

**Express.js** microframework starter package with database **mysql** configuration. Suitable for use REST API projects.

## Features

- Express.js REST API
- MySQL Database Integration
- Environment Variables (.env)
- Middleware Support
- CORS Configuration
- API Versioning Ready
- Clean Folder Structure

---

## Tech Stack

| Technology      | Description                     |
| --------------- | ------------------------------- |
| Node.js         | JavaScript Runtime              |
| Express.js      | Backend Framework               |
| MySQL           | Relational Database             |
| mysql2          | MySQL Driver                    |
| dotenv          | Environment Variable Management |
| cors            | Cross-Origin Resource Sharing   |
| nodemon         | Development Auto Reload         |
| express-session | Session for application         |
| cookie-parser   |

---

## Project Structure

```bash
project/
│
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
├── .env
├── .gitignore
├── main.js
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation

Clone repository:

```bash
git clone https://github.com/alwannelson/starterpack-expressjs.git
```

Go to your project folder:

```bash
cd starterpack-expressjs
```

Install dependencies:

```bash
npm install
```

Run your app:

```bash
npm run dev
```

---

## API Example

### Get All Users

```http
GET /api/hello
```

Response:

```json
{
  "status": "success",
  "message": "Hello Dev!"
}
```

---

## Installed Packages

```json
{
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "express-session": "^1.19.0",
  "mysql2": "^3.22.5",
  "nodemon": "^3.1.14",
  "path": "^0.12.7"
}
```

---

## Author

**Alwan Aditia**

- Web Developer
- Information Systems Student
- Backend & API Enthusiast

GitHub:
https://github.com/alwannelson

Instagram:
https://instagram.com/awannaditia

---