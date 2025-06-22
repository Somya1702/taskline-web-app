const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './')));

// Database setup
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_description TEXT,
        due_date TEXT, -- Expected format: YYYY-MM-DD
        stage TEXT,
        status TEXT,
        litigation_details TEXT,
        tribunal_details TEXT,
        billing_status TEXT,
        billing_inv TEXT,
        billing_real TEXT,
        reminder_days INTEGER,
        reminder_status TEXT,
        reminder_remaining INTEGER,
        others_poc TEXT,
        others_pending TEXT,
        fees_agreed TEXT,
        fees_realised TEXT,
        fees_counsel TEXT,
        misc TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes for tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/tasks', (req, res) => {
    const { 
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc 
    } = req.body;
    
    const sql = `INSERT INTO tasks (
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Task created successfully' });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { 
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc 
    } = req.body;
        
    const sql = `UPDATE tasks SET 
        task_description=?, due_date=?, stage=?, status=?, litigation_details=?, 
        tribunal_details=?, billing_status=?, billing_inv=?, billing_real=?, 
        reminder_days=?, reminder_status=?, reminder_remaining=?, others_poc=?, 
        others_pending=?, fees_agreed=?, fees_realised=?, fees_counsel=?, misc=?, 
        updated_at=CURRENT_TIMESTAMP 
        WHERE id=?`;
    
    db.run(sql, [
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc, 
        req.params.id
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task updated successfully' });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const sql = 'DELETE FROM tasks WHERE id=?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// API Routes for task statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        totalTasks: "SELECT COUNT(*) as count FROM tasks",
        openTasks: "SELECT COUNT(*) as count FROM tasks WHERE status = 'Open'",
        inProgressTasks: "SELECT COUNT(*) as count FROM tasks WHERE status = 'In-Progress'",
        completedTasks: "SELECT COUNT(*) as count FROM tasks WHERE status = 'Close'",
        overdueTasks: "SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status != 'Close'"
    };

    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, sql]) => {
        db.get(sql, [], (err, row) => {
            if (err) {
                if (!res.headersSent) {
                    res.status(500).json({ error: err.message });
                }
                return;
            }
            stats[key] = row.count;
            completedQueries++;

            if (completedQueries === totalQueries) {
                res.json(stats);
            }
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
}); 