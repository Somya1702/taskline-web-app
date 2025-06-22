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
        name TEXT NOT NULL,
        resource TEXT,
        entity_group TEXT,
        entity TEXT,
        state TEXT,
        task_description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'pending',
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
    const { name, resource, entity_group, entity, state, task_description, due_date } = req.body;
    const sql = `INSERT INTO tasks (name, resource, entity_group, entity, state, task_description, due_date) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, resource, entity_group, entity, state, task_description, due_date], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Task created successfully' });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { name, resource, entity_group, entity, state, task_description, due_date, status } = req.body;
    const sql = `UPDATE tasks SET name=?, resource=?, entity_group=?, entity=?, state=?, 
                  task_description=?, due_date=?, status=?, updated_at=CURRENT_TIMESTAMP 
                  WHERE id=?`;
    
    db.run(sql, [name, resource, entity_group, entity, state, task_description, due_date, status, req.params.id], function(err) {
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
    const stats = {};
    
    // Due today
    db.get("SELECT COUNT(*) as count FROM tasks WHERE date(due_date) = date('now')", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        stats.dueToday = row.count;
        
        // Due this week
        db.get("SELECT COUNT(*) as count FROM tasks WHERE date(due_date) BETWEEN date('now') AND date('now', '+7 days')", (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            stats.dueThisWeek = row.count;
            
            // Due next week
            db.get("SELECT COUNT(*) as count FROM tasks WHERE date(due_date) BETWEEN date('now', '+7 days') AND date('now', '+14 days')", (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                stats.dueNextWeek = row.count;
                
                // Next 15 days
                db.get("SELECT COUNT(*) as count FROM tasks WHERE date(due_date) BETWEEN date('now') AND date('now', '+15 days')", (err, row) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    stats.next15Days = row.count;
                    
                    // Overdue
                    db.get("SELECT COUNT(*) as count FROM tasks WHERE date(due_date) < date('now') AND status != 'completed'", (err, row) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        stats.overdue = row.count;
                        res.json(stats);
                    });
                });
            });
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