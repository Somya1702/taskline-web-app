// Global variables
let tasks = [];
let currentStats = {};

// DOM elements
const taskTableBody = document.querySelector('tbody');
const summaryCards = document.querySelectorAll('.card .count');
const newTaskBtn = document.querySelector('.new-task-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    loadStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    newTaskBtn.addEventListener('click', () => showTaskModal());
    
    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', filterTasks);
    
    // Task action buttons
    document.querySelectorAll('.task-actions button').forEach(btn => {
        btn.addEventListener('click', handleTaskAction);
    });
}

// Load tasks from API
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

// Load statistics from API
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        updateSummaryCards(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render tasks in the table
function renderTasks() {
    taskTableBody.innerHTML = '';
    
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.dataset.stage = task.stage; // For styling based on stage
        row.innerHTML = `
            <td>${task.task_description || '-'}</td>
            <td class="due-date ${getDueDateClass(task.due_date)}">${formatDisplayDate(task.due_date) || '-'}</td>
            <td><span class="stage-badge">${task.stage || '-'}</span></td>
            <td><span class="status-badge status-${(task.status || '').toLowerCase()}">${task.status || '-'}</span></td>
            <td>${task.litigation_details || '-'}</td>
            <td>${task.tribunal_details || '-'}</td>
            <td>
                Status: ${task.billing_status || '-'}<br>
                Inv: ${task.billing_inv || '-'}<br>
                Real: ${task.billing_real || '-'}
            </td>
            <td>
                Days: ${task.reminder_days || '-'}<br>
                Status: ${task.reminder_status || '-'}<br>
                Remaining: ${task.reminder_remaining || '-'}
            </td>
            <td>
                POC: ${task.others_poc || '-'}<br>
                Pending: ${task.others_pending || '-'}
            </td>
            <td>
                Agreed: ${task.fees_agreed || '-'}<br>
                Realised: ${task.fees_realised || '-'}<br>
                Counsel: ${task.fees_counsel || '-'}
            </td>
            <td>${task.misc || '-'}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                <button class="action-btn print-btn"><i class="fas fa-print"></i></button>
            </td>
        `;
        taskTableBody.appendChild(row);
    });
}

function getDueDateClass(dueDateStr) {
    if (!dueDateStr) return '';
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (dueDate < today) {
        return 'overdue';
    }
    return '';
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

// Update summary cards with real data
function updateSummaryCards(stats) {
    document.getElementById('stats-due-today').textContent = stats.dueToday || 0;
    document.getElementById('stats-due-this-week').textContent = stats.dueThisWeek || 0;
    document.getElementById('stats-due-next-week').textContent = stats.dueNextWeek || 0;
    document.getElementById('stats-next-15-days').textContent = stats.next15Days || 0;
    document.getElementById('stats-overdue').textContent = stats.overdue || 0;

    const overdueDetail = document.getElementById('stats-due-today-overdue');
    if (stats.overdue > 0) {
        overdueDetail.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${stats.overdue} overdue tasks`;
    } else {
        overdueDetail.innerHTML = '';
    }
}

// Show modal for adding or editing a task
function showTaskModal(task = {}) {
    const isEdit = !!task.id;
    const modalTitle = isEdit ? 'Edit Task' : 'Add New Task';
    
    const modal = createModal(modalTitle, `
        <form id="taskForm">
            <div class="form-grid">
                <div class="form-group">
                    <label>Task Description</label>
                    <textarea name="task_description">${task.task_description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" name="due_date" value="${task.due_date || ''}">
                </div>
                <div class="form-group">
                    <label>Stage</label>
                    <input type="text" name="stage" value="${task.stage || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="Open" ${task.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="Close" ${task.status === 'Close' ? 'selected' : ''}>Close</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Litigation Details</label>
                    <textarea name="litigation_details">${(task.litigation_details || '').replace(/<br>/g, '\\n')}</textarea>
                </div>
                <div class="form-group">
                    <label>Tribunal/Court Details</label>
                    <textarea name="tribunal_details">${(task.tribunal_details || '').replace(/<br>/g, '\\n')}</textarea>
                </div>
                 <div class="form-group">
                    <label>Misc</label>
                    <textarea name="misc">${(task.misc || '').replace(/<br>/g, '\\n')}</textarea>
                </div>
            </div>
            
            <fieldset>
                <legend>Billing</legend>
                <div class="form-grid">
                    <input type="text" name="billing_status" placeholder="Status" value="${task.billing_status || ''}">
                    <input type="text" name="billing_inv" placeholder="Invoice" value="${task.billing_inv || ''}">
                    <input type="text" name="billing_real" placeholder="Realisation" value="${task.billing_real || ''}">
                </div>
            </fieldset>

             <fieldset>
                <legend>Reminder</legend>
                <div class="form-grid">
                    <input type="number" name="reminder_days" placeholder="Days" value="${task.reminder_days || ''}">
                    <input type="text" name="reminder_status" placeholder="Status" value="${task.reminder_status || ''}">
                    <input type="number" name="reminder_remaining" placeholder="Remaining" value="${task.reminder_remaining || ''}">
                </div>
            </fieldset>

             <fieldset>
                <legend>Others</legend>
                <div class="form-grid">
                    <input type="text" name="others_poc" placeholder="POC" value="${task.others_poc || ''}">
                    <input type="text" name="others_pending" placeholder="Pending" value="${task.others_pending || ''}">
                </div>
            </fieldset>

            <fieldset>
                <legend>Fees</legend>
                <div class="form-grid">
                    <input type="text" name="fees_agreed" placeholder="Agreed" value="${task.fees_agreed || ''}">
                    <input type="text" name="fees_realised" placeholder="Realised" value="${task.fees_realised || ''}">
                    <input type="text" name="fees_counsel" placeholder="Counsel" value="${task.fees_counsel || ''}">
                </div>
            </fieldset>

            <div class="form-actions">
                <button type="button" onclick="closeModal()">Cancel</button>
                <button type="submit">${isEdit ? 'Update' : 'Save'} Task</button>
            </div>
        </form>
    `);
    
    document.body.appendChild(modal);
    
    document.getElementById('taskForm').addEventListener('submit', (event) => {
        handleTaskSubmit(event, task.id);
    });
}

// Create modal element
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    return modal;
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Handle task form submission for both create and update
async function handleTaskSubmit(event, taskId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = Object.fromEntries(formData.entries());

    // Convert newlines in textareas back to <br> for HTML display
    taskData.litigation_details = taskData.litigation_details.replace(/\\n/g, '<br>');
    taskData.tribunal_details = taskData.tribunal_details.replace(/\\n/g, '<br>');
    taskData.misc = taskData.misc.replace(/\\n/g, '<br>');

    const isEdit = !!taskId;
    const url = isEdit ? `/api/tasks/${taskId}` : '/api/tasks';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to ${isEdit ? 'update' : 'create'} task`);
        }
        
        closeModal();
        loadTasks(); // Reload tasks to show changes
        loadStats(); // Reload stats to show changes
    } catch (error) {
        console.error(`Error ${isEdit ? 'updating' : 'creating'} task:`, error);
    }
}

// Edit task - fetches task data and shows modal
async function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        showTaskModal(task);
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        loadTasks(); // Reload tasks
        loadStats(); // Reload stats
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Filter tasks based on search input
function filterTasks(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = taskTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Handle task action buttons
function handleTaskAction(event) {
    const action = event.target.textContent.toLowerCase();
    
    switch (action) {
        case 'clear filters':
            document.querySelector('.search-container input').value = '';
            filterTasks({ target: { value: '' } });
            break;
        case 'import':
            showNotification('Import functionality coming soon!', 'info');
            break;
        case 'export':
            exportTasks();
            break;
        case 'print':
            window.print();
            break;
    }
}

// Export tasks to CSV
function exportTasks() {
    const headers = ['S.No', 'Name', 'Resource', 'Entity Group', 'Entity', 'State', 'Task Description', 'Due Date', 'Status'];
    const csvContent = [
        headers.join(','),
        ...tasks.map((task, index) => [
            index + 1,
            task.name,
            task.resource || '',
            task.entity_group || '',
            task.entity || '',
            task.state || '',
            `"${task.task_description || ''}"`,
            task.due_date || '',
            task.status || ''
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Tasks exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 