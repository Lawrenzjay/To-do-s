// DOM elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const inputSection = document.getElementById('input-section');
const navTabs = document.querySelectorAll('.nav-tab');
const hamburger = document.getElementById('hamburger');
const navBar = document.getElementById('nav-bar');

// Current filter
let currentFilter = 'todo';

// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Hamburger menu event listener
hamburger.addEventListener('click', () => {
    navBar.classList.toggle('open');
});

// Navigation tab event listeners
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        navTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        // Update current filter
        currentFilter = tab.dataset.status;
        // Filter tasks
        filterTasks();
        // Update stats
        updateStats();
        // Toggle input section visibility
        toggleInputSection();
        // Close navigation menu on mobile
        navBar.classList.remove('open');
    });
});

// Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now(),
        text: taskText,
        status: currentFilter,
        completed: false
    };

    saveTask(task);
    taskInput.value = '';
    filterTasks();
    updateStats();
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.status}`;
    li.dataset.id = task.id;

    let actionButton = '';
    if (task.status === 'todo') {
        actionButton = '<button class="start-btn">Start</button>';
    } else if (task.status === 'ongoing') {
        actionButton = '<button class="complete-btn">Complete</button>';
    } else if (task.status === 'done') {
        actionButton = '<button class="restart-btn">Restart</button>';
    }

    li.innerHTML = `
        <span class="task-text">${task.text}</span>
        <select class="status-select">
            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To-Do</option>
            <option value="ongoing" ${task.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
        <div class="task-actions">
            ${actionButton}
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    // Event listeners for the task item
    const statusSelect = li.querySelector('.status-select');
    const taskTextEl = li.querySelector('.task-text');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');

    statusSelect.addEventListener('change', () => changeTaskStatus(task.id, statusSelect.value));
    taskTextEl.addEventListener('click', () => changeTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done'));
    editBtn.addEventListener('click', () => editTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    // Action button event listeners
    const startBtn = li.querySelector('.start-btn');
    const completeBtn = li.querySelector('.complete-btn');
    const restartBtn = li.querySelector('.restart-btn');

    if (startBtn) startBtn.addEventListener('click', () => changeTaskStatus(task.id, 'ongoing'));
    if (completeBtn) completeBtn.addEventListener('click', () => changeTaskStatus(task.id, 'done'));
    if (restartBtn) restartBtn.addEventListener('click', () => changeTaskStatus(task.id, 'todo'));

    taskList.appendChild(li);
}

function toggleTask(id) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskDisplay();
        updateStats();
    }
}

function editTask(id) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskDisplay();
    }
}

function deleteTask(id) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    updateTaskDisplay();
    updateStats();
}

function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(task => createTaskElement(task));
    updateStats();
}

function updateTaskDisplay() {
    taskList.innerHTML = '';
    loadTasks();
}

function updateStats() {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;

    totalTasksEl.textContent = `Total: ${total}`;
    completedTasksEl.textContent = `Completed: ${completed}`;
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function changeTaskStatus(id, newStatus) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        filterTasks();
        updateStats();
    }
}

function filterTasks() {
    const tasks = getTasks();
    let filteredTasks;
    if (currentFilter === 'ongoing') {
        filteredTasks = tasks.filter(task => task.status !== 'done');
    } else {
        filteredTasks = tasks.filter(task => task.status === currentFilter);
    }
    taskList.innerHTML = '';
    filteredTasks.forEach(task => createTaskElement(task));
}

function toggleInputSection() {
    if (currentFilter === 'todo') {
        inputSection.style.display = 'flex';
    } else {
        inputSection.style.display = 'none';
    }
}
