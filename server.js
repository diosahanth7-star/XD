// Importar módulos
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Declarar app
const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Configuración Multer para subir videos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/videos');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Página principal
app.get('/', (req, res) => {
    db.query('SELECT * FROM videos ORDER BY uploaded_at DESC', (err, results) => {
        if (err) throw err;

        fs.readFile('./views/index.html', 'utf8', (err, html) => {
            if (err) throw err;

            let videoHTML = '';
            results.forEach(video => {
                videoHTML += `
                    <h2>${video.title}</h2>
                    <p>${video.description}</p>
                    <video width="320" controls>
                        <source src="${video.url}" type="video/mp4">
                    </video><hr>
                `;
            });

            html = html.replace('<div id="video-list"></div>', videoHTML);
            res.send(html);
        });
    });
});

// Página de subida
app.get('/upload', (req, res) => {
    fs.readFile('./views/upload.html', 'utf8', (err, html) => {
        if (err) throw err;
        res.send(html);
    });
});

// Manejo de subida de videos
app.post('/upload', upload.single('video'), (req, res) => {
    const { title, description } = req.body;
    const url = '/videos/' + req.file.filename;
    db.query('INSERT INTO videos (title, description, url) VALUES (?, ?, ?)',
        [title, description, url], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`MoonVideo corriendo en http://localhost:${PORT}`));
