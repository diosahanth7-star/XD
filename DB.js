const mysql = require('mysql2');

// Conexión usando variables de entorno de Railway
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// SQL para crear la tabla si no existe
const sql = `
CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(sql, (err) => {
    if (err) throw err;
    console.log("Tabla 'videos' creada o ya existente.");
    db.end();
});
