//configuration 
// Configuration
const API_URL = 'http://localhost:5000/api/tasks';

// Éléments DOM
const newTaskBtn = document.getElementById('new-task-btn');
const taskModal = document.getElementById('task-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const taskTitleInput = document.getElementById('task-title');
const taskCategoryInput = document.getElementById('task-category');
const titleError = document.getElementById('title-error');

// État de l'application
let tasks = [];

// Fonctions principales
function initApp() {
    console.log('Application TaskFlow initialisée');
    
    // Charger les tâches au démarrage
    loadTasks();
    
    // Configurer les événements
    setupEventListeners();
}

function loadTasks() {
    console.log('Chargement des tâches depuis l\'API...');
    // À implémenter
    displayMessage('Chargement des tâches...');
}

function displayMessage(message) {
    tasksContainer.innerHTML = `<p class="loading">${message}</p>`;
}

function setupEventListeners() {
    // Ouvrir modal
    newTaskBtn.addEventListener('click', () => {
        taskModal.style.display = 'block';
    });
    
    // Fermer modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            taskModal.style.display = 'none';
            resetForm();
        });
    });
    
    // Fermer modal en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
            resetForm();
        }
    });
    
    // Soumettre le formulaire
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        createTask();
    });
}

function resetForm() {
    taskForm.reset();
    hideError();
}

function hideError() {
    titleError.style.display = 'none';
    taskTitleInput.style.borderColor = '#ddd';
}

function createTask() {
    console.log('Création d\'une nouvelle tâche...');
    // À implémenter
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initApp);

