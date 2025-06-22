const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database for initialization.');
    }
});

// Sample data
const sampleTasks = [
    {
        name: 'John Smith',
        resource: 'Amit Sharma',
        entity_group: 'Corporate',
        entity: 'ABC Ltd',
        state: 'Maharashtra',
        task_description: 'GST compliance review and submission',
        due_date: '2024-01-15',
        status: 'pending'
    },
    {
        name: 'Priya Patel',
        resource: 'Neha Singh',
        entity_group: 'Individual',
        entity: 'XYZ Pvt. Ltd',
        state: 'Gujarat',
        task_description: 'Income tax assessment and TD submission',
        due_date: '2024-01-10',
        status: 'overdue'
    },
    {
        name: 'Rajesh Kumar',
        resource: 'Suresh Verma',
        entity_group: 'Corporate',
        entity: 'DEF Corp',
        state: 'Delhi',
        task_description: 'Annual audit preparation',
        due_date: '2024-01-20',
        status: 'pending'
    },
    {
        name: 'Meera Iyer',
        resource: 'Anita Desai',
        entity_group: 'Individual',
        entity: 'GHI Enterprises',
        state: 'Karnataka',
        task_description: 'TDS return filing',
        due_date: '2024-01-25',
        status: 'pending'
    },
    {
        name: 'Vikram Singh',
        resource: 'Rahul Gupta',
        entity_group: 'Corporate',
        entity: 'JKL Industries',
        state: 'Punjab',
        task_description: 'Company law compliance',
        due_date: '2024-01-05',
        status: 'overdue'
    }
];

// Initialize database with sample data
db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM tasks');
    
    // Insert sample tasks
    const insertTask = db.prepare(`INSERT INTO tasks 
        (name, resource, entity_group, entity, state, task_description, due_date, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
    sampleTasks.forEach(task => {
        insertTask.run([
            task.name,
            task.resource,
            task.entity_group,
            task.entity,
            task.state,
            task.task_description,
            task.due_date,
            task.status
        ], (err) => {
            if (err) {
                console.error('Error inserting task:', err.message);
            } else {
                console.log(`Inserted task: ${task.name}`);
            }
        });
    });
    
    insertTask.finalize((err) => {
        if (err) {
            console.error('Error finalizing insert:', err.message);
        } else {
            console.log('Database initialization completed successfully!');
            console.log(`Inserted ${sampleTasks.length} sample tasks.`);
        }
        
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}); 