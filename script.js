// Global variables
let tasks = [];
let currentStats = {};

// DOM elements
const taskTable = document.querySelector('tbody');
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
    newTaskBtn.addEventListener('click', showNewTaskModal);
    
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
        currentStats = await response.json();
        updateSummaryCards();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render tasks in the table
function renderTasks() {
    taskTable.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-id="${task.id}"></td>
            <td>${String(index + 1).padStart(3, '0')}</td>
            <td>${task.name}</td>
            <td>${task.resource || '-'}</td>
            <td>${task.entity_group || '-'}</td>
            <td>${task.entity || '-'}</td>
            <td>${task.state || '-'}</td>
            <td>
                <div class="task-cell">
                    <span class="task-description">${task.task_description || '-'}</span>
                    <div class="task-actions-cell">
                        <button class="edit-btn" onclick="editTask(${task.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </td>
        `;
        
        // Add status-based styling
        if (task.status === 'overdue') {
            row.classList.add('overdue-row');
        }
        
        taskTable.appendChild(row);
    });
}

// Update summary cards with real data
function updateSummaryCards() {
    if (summaryCards.length >= 5) {
        summaryCards[0].textContent = currentStats.dueToday || 0;
        summaryCards[1].textContent = currentStats.dueThisWeek || 0;
        summaryCards[2].textContent = currentStats.dueNextWeek || 0;
        summaryCards[3].textContent = currentStats.next15Days || 0;
        summaryCards[4].textContent = currentStats.overdue || 0;
    }
}

// Show new task modal
function showNewTaskModal() {
    const modal = createModal('Add New Task', `
        <form id="taskForm">
            <div class="form-group">
                <label for="name">Name *</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="resource">Resource</label>
                <input type="text" id="resource" name="resource">
            </div>
            <div class="form-group">
                <label for="entity_group">Entity Group</label>
                <select id="entity_group" name="entity_group">
                    <option value="">Select Entity Group</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Individual">Individual</option>
                </select>
            </div>
            <div class="form-group">
                <label for="entity">Entity</label>
                <input type="text" id="entity" name="entity">
            </div>
            <div class="form-group">
                <label for="state">State</label>
                <input type="text" id="state" name="state">
            </div>
            <div class="form-group">
                <label for="task_description">Task Description</label>
                <textarea id="task_description" name="task_description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="due_date">Due Date</label>
                <input type="date" id="due_date" name="due_date">
            </div>
            <div class="form-actions">
                <button type="button" onclick="closeModal()">Cancel</button>
                <button type="submit">Save Task</button>
            </div>
        </form>
    `);
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
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

// Handle task form submission
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            showNotification('Task created successfully!', 'success');
            closeModal();
            loadTasks();
            loadStats();
        } else {
            throw new Error('Failed to create task');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Error creating task', 'error');
    }
}

// Edit task
async function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = createModal('Edit Task', `
        <form id="editTaskForm">
            <div class="form-group">
                <label for="edit_name">Name *</label>
                <input type="text" id="edit_name" name="name" value="${task.name}" required>
            </div>
            <div class="form-group">
                <label for="edit_resource">Resource</label>
                <input type="text" id="edit_resource" name="resource" value="${task.resource || ''}">
            </div>
            <div class="form-group">
                <label for="edit_entity_group">Entity Group</label>
                <select id="edit_entity_group" name="entity_group">
                    <option value="">Select Entity Group</option>
                    <option value="Corporate" ${task.entity_group === 'Corporate' ? 'selected' : ''}>Corporate</option>
                    <option value="Individual" ${task.entity_group === 'Individual' ? 'selected' : ''}>Individual</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit_entity">Entity</label>
                <input type="text" id="edit_entity" name="entity" value="${task.entity || ''}">
            </div>
            <div class="form-group">
                <label for="edit_state">State</label>
                <input type="text" id="edit_state" name="state" value="${task.state || ''}">
            </div>
            <div class="form-group">
                <label for="edit_task_description">Task Description</label>
                <textarea id="edit_task_description" name="task_description" rows="3">${task.task_description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="edit_due_date">Due Date</label>
                <input type="date" id="edit_due_date" name="due_date" value="${task.due_date || ''}">
            </div>
            <div class="form-group">
                <label for="edit_status">Status</label>
                <select id="edit_status" name="status">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="overdue" ${task.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" onclick="closeModal()">Cancel</button>
                <button type="submit">Update Task</button>
            </div>
        </form>
    `);
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editTaskForm').addEventListener('submit', (event) => {
        handleTaskUpdate(event, taskId);
    });
}

// Handle task update
async function handleTaskUpdate(event, taskId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            showNotification('Task updated successfully!', 'success');
            closeModal();
            loadTasks();
            loadStats();
        } else {
            throw new Error('Failed to update task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Task deleted successfully!', 'success');
            loadTasks();
            loadStats();
        } else {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

// Filter tasks based on search input
function filterTasks(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = taskTable.querySelectorAll('tr');
    
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