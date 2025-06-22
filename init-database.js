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
        task_description: 'GST compliance review and submission',
        due_date: '2025-01-15',
        stage: 'In Progress',
        status: 'Open',
        litigation_details: 'SCN: SCN/2024/001<br>Sec: 73<br>Input tax credit disc...',
        tribunal_details: 'Appeal: APP/2024/001<br>Mumbai<br>Adv. Rajesh Kumar',
        billing_status: 'Sent',
        billing_inv: 'INV/2024/001',
        billing_real: 'Partial',
        reminder_days: 7,
        reminder_status: 'Sent',
        reminder_remaining: 3,
        others_poc: 'Rahul Verma',
        others_pending: 'Client',
        fees_agreed: '₹50000',
        fees_realised: '₹25000',
        fees_counsel: '₹15000',
        misc: 'High priority case Client follow-up req...'
    },
    {
        task_description: 'Income tax assessment and TD...',
        due_date: '2025-01-20',
        stage: 'Review',
        status: 'Open',
        litigation_details: 'SCN: AST/2024/002<br>Sec: 74<br>TDS mismatch',
        tribunal_details: 'Appeal: APP/2024/002<br>Ahmedabad<br>Adv. Meera Shah',
        billing_status: 'Draft',
        billing_inv: '',
        billing_real: 'Pending',
        reminder_days: 14,
        reminder_status: 'Pending',
        reminder_remaining: 10,
        others_poc: 'Suresh Kumar',
        others_pending: 'Department',
        fees_agreed: '₹35000',
        fees_realised: '₹35000',
        fees_counsel: '₹10000',
        misc: 'Regular compliance'
    },
    {
        task_description: 'VAT audit and compliance verific...',
        due_date: '2024-12-31',
        stage: 'Completed',
        status: 'Close',
        litigation_details: 'SCN: VAT/2024/003<br>Sec: 75<br>Output tax calculati...',
        tribunal_details: 'New Delhi',
        billing_status: 'Paid',
        billing_inv: 'INV/2024/003',
        billing_real: 'Full',
        reminder_days: 0,
        reminder_status: 'Completed',
        reminder_remaining: 0,
        others_poc: 'Anita Sharma',
        others_pending: 'Completed: 20-Dec-24',
        fees_agreed: '₹25000',
        fees_realised: '₹25000',
        fees_counsel: '₹5000',
        misc: 'Completed on time Client satisfied'
    },
    // New data for dashboard stats
    {
        task_description: 'Overdue Task 1: Annual Report Filing',
        due_date: '2024-06-01',
        stage: 'Pending',
        status: 'Open',
        litigation_details: 'N/A',
        tribunal_details: 'N/A',
        billing_status: 'Not Billed',
        billing_inv: '',
        billing_real: '',
        reminder_days: 0,
        reminder_status: 'Alert',
        reminder_remaining: 0,
        others_poc: 'Team Lead',
        others_pending: 'Internal',
        fees_agreed: '₹10000',
        fees_realised: '₹0',
        fees_counsel: '₹0',
        misc: 'Follow up immediately.'
    },
    {
        task_description: 'Overdue Task 2: Client Document Collection',
        due_date: '2024-06-10',
        stage: 'Pending',
        status: 'Open',
        litigation_details: 'N/A',
        tribunal_details: 'N/A',
        billing_status: 'Not Billed',
        billing_inv: '',
        billing_real: '',
        reminder_days: 0,
        reminder_status: 'Alert',
        reminder_remaining: 0,
        others_poc: 'Client',
        others_pending: 'Awaiting documents',
        fees_agreed: '₹5000',
        fees_realised: '₹0',
        fees_counsel: '₹0',
        misc: 'Client unresponsive, needs escalation.'
    },
    // Adding more diverse data
    {
        task_description: 'Urgent: Submit tax clarification',
        due_date: new Date().toISOString().slice(0, 10), // Due Today
        stage: 'In Progress',
        status: 'Open',
        litigation_details: 'Reply to notice XYZ/123',
        tribunal_details: 'Local Tax Office',
        billing_status: 'Billed',
        billing_inv: 'INV/2024/004',
        billing_real: 'Pending',
        reminder_days: 1,
        reminder_status: 'Final Reminder',
        reminder_remaining: 1,
        others_poc: 'Accounts Dept',
        others_pending: 'Awaiting final numbers',
        fees_agreed: '₹20000',
        fees_realised: '₹0',
        fees_counsel: '₹5000',
        misc: 'Due by EOD.'
    },
    {
        task_description: 'Prepare for quarterly review meeting',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Due in 5 days
        stage: 'Review',
        status: 'Open',
        litigation_details: 'N/A',
        tribunal_details: 'Internal',
        billing_status: 'N/A',
        billing_inv: '',
        billing_real: '',
        reminder_days: 3,
        reminder_status: 'Scheduled',
        reminder_remaining: 3,
        others_poc: 'Management',
        others_pending: 'Agenda preparation',
        fees_agreed: 'N/A',
        fees_realised: 'N/A',
        fees_counsel: 'N/A',
        misc: 'Coordinate with all team leads.'
    },
    {
        task_description: 'Legal research for Case #456',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Due in 12 days
        stage: 'Pending',
        status: 'Open',
        litigation_details: 'Case #456-B',
        tribunal_details: 'High Court',
        billing_status: 'To be Billed',
        billing_inv: '',
        billing_real: '',
        reminder_days: 7,
        reminder_status: 'Not Started',
        reminder_remaining: 7,
        others_poc: 'Legal Team',
        others_pending: 'Initial research phase',
        fees_agreed: '₹75000',
        fees_realised: '₹15000',
        fees_counsel: '₹25000',
        misc: 'Complex case, requires detailed analysis.'
    }
];

// Initialize database with sample data
db.serialize(() => {
    // Clear existing data - handled by DROP TABLE in server.js now
    
    // Insert sample tasks
    const insertTask = db.prepare(`INSERT INTO tasks (
        task_description, due_date, stage, status, litigation_details, 
        tribunal_details, billing_status, billing_inv, billing_real, 
        reminder_days, reminder_status, reminder_remaining, others_poc, 
        others_pending, fees_agreed, fees_realised, fees_counsel, misc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    sampleTasks.forEach(task => {
        insertTask.run([
            task.task_description, task.due_date, task.stage, task.status, task.litigation_details,
            task.tribunal_details, task.billing_status, task.billing_inv, task.billing_real,
            task.reminder_days, task.reminder_status, task.reminder_remaining, task.others_poc,
            task.others_pending, task.fees_agreed, task.fees_realised, task.fees_counsel, task.misc
        ], (err) => {
            if (err) {
                console.error('Error inserting task:', err.message);
            } else {
                console.log(`Inserted task: ${task.task_description.substring(0, 20)}...`);
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