




// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "student_management_system",
//     port: Number(process.env.DB_PORT) || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

// module.exports = pool;

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_management_system",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;