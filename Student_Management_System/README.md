# Student Management System

A full-stack Student Management System built with React Vite, Node.js, Express, MySQL/MariaDB, and Docker.

## Features

### Admin

- Manage students
- Manage teachers
- Manage departments
- Manage courses
- Manage enrollments
- Manage users
- View reports
- Auto-generate Student ID and Teacher ID

### Teacher

- View assigned courses
- Create assignments
- View student submissions
- Download and view submitted PDF files
- Give feedback on submissions
- Manage grades
- View reports

### Student

- View enrolled courses
- View assignments
- Submit assignments as PDF files
- Resubmit or replace PDF files
- Add messages to teachers
- View teacher feedback
- View grades
- View reports

## Technology Stack

### Frontend

- React Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MySQL2
- JWT authentication
- bcrypt
- multer for PDF uploads

### Database

- MariaDB / MySQL

### DevOps

- Docker
- Docker Compose

## Project Structure

```text
Student_Management_System/
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── student-list.csv
│   ├── teacher-list.csv
│   ├── department-list.csv
│   └── courses-list.csv
├── docker-compose.yml
└── README.md
```

## Import the Year 2 student list

The importer replaces all existing student users, student profiles, enrollments, and their attendance/grade records. It preserves administrators, teachers, departments, courses, and assignments.

1. Place the workbook at `database/student-list.xlsx` with the student data in `Sheet1` (columns A-C, starting around row 9).
2. Run locally:

   ```powershell
   cd backend
   npm install
   npm run import:students -- --yes
   ```

3. With Docker Compose, ensure the workbook is available in the project and run:

   ```powershell
   docker compose exec backend npm run import:students -- --yes
   ```

Imported students receive sequential codes such as `STU-0001`, usernames such as `stu-0001`, the default password `Student@123`, Year 2, and the Information Technology Engineering department. The utility uses ExcelJS, preserves Khmer Unicode text, and falls back to `database/student-list.csv` encoded as UTF-8 if Excel parsing fails. It is never run during server startup and uses a database transaction, so a failed import is rolled back.

To run inside the named container instead:

```powershell
docker exec -it sms_backend npm run import:students -- --yes
```

If ExcelJS reports a corrupted ZIP/container, obtain a fresh copy of the workbook or open the original source in Excel and save it as `database/student-list.csv` using CSV UTF-8 format. The importer will automatically try that CSV after Excel parsing fails.
