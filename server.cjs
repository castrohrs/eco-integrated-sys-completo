
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());

// Configuração de Armazenamento de Arquivos
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});

// Servir arquivos estáticos (URLs Públicas)
app.use('/uploads', express.static(uploadDir));

// Endpoint Real de Upload
app.post('/api/upload', upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ 
        url: fileUrl, 
        type: req.file.mimetype,
        name: req.file.originalname 
    });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const dbPath = path.resolve(__dirname, 'chat_history.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        sender_name TEXT,
        message_text TEXT,
        media_url TEXT,
        media_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('register', (userData) => {
        if (!userData?.id) return;
        socket.userId = userData.id;
        onlineUsers[userData.id] = { socketId: socket.id, userName: userData.name };
    });

    socket.on('get_chat_history', (data) => {
        const { myId, targetId } = data;
        const sql = `SELECT * FROM messages 
                     WHERE (sender_id = ? AND receiver_id = ?) 
                        OR (sender_id = ? AND receiver_id = ?)
                     ORDER BY timestamp ASC LIMIT 100`;
        
        db.all(sql, [myId, targetId, targetId, myId], (err, rows) => {
            if (!err) {
                const history = rows.map(row => ({
                    id: row.id.toString(),
                    text: row.message_text,
                    mediaUrl: row.media_url,
                    mediaType: row.media_type,
                    senderId: row.sender_id,
                    senderName: row.sender_name,
                    timestamp: row.timestamp
                }));
                socket.emit('chat_history', history);
            }
        });
    });

    socket.on('private_message', (data) => {
        const { fromId, toId, fromName, text, mediaUrl, mediaType } = data;
        
        const stmt = db.prepare(`INSERT INTO messages (sender_id, receiver_id, sender_name, message_text, media_url, media_type) VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(fromId, toId, fromName, text, mediaUrl, mediaType, function(err) {
            if (!err) {
                const newMessage = {
                    id: this.lastID.toString(),
                    text,
                    mediaUrl,
                    mediaType,
                    senderId: fromId,
                    senderName: fromName,
                    timestamp: new Date().toISOString()
                };
                socket.emit('new_private_message', newMessage);
                if (onlineUsers[toId]) {
                    io.to(onlineUsers[toId].socketId).emit('new_private_message', newMessage);
                }
            }
        });
        stmt.finalize();
    });

    socket.on('disconnect', () => {
        if (socket.userId) delete onlineUsers[socket.userId];
    });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Backend de Mídia e Chat rodando na porta ${PORT}`));
