//configuration 
// Configuration
const API_URL = 'http://localhost:3000/api/tasks';

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

async function loadTasks() {
    console.log('📥 Chargement des tâches depuis l\'API...');
    displayMessage('Chargement en cours...');
    
    try {
        // 1. Faire la requête GET à l'API
        const response = await fetch(API_URL);
        
        // 2. Vérifier si la réponse est OK
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // 3. Parser la réponse JSON
        const result = await response.json();
        
        // 4. Vérifier la structure de la réponse
        if (result.success && Array.isArray(result.data)) {
            tasks = result.data;
            console.log(`✅ ${tasks.length} tâche(s) chargée(s)`);
            
            // 5. Afficher les tâches
            displayTasks();
        } else {
            throw new Error('Format de réponse invalide');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        displayMessage(`Erreur: ${error.message}`);
    }
};

function displayTasks() {
    // Si pas de tâches
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <p>🎉 Aucune tâche pour le moment</p>
                <p>Commencez par créer votre première tâche !</p>
            </div>
        `;
        return;
    }
    
    // Créer le HTML pour chaque tâche
    const tasksHTML = tasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div class="task-content">
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="task-category">${escapeHTML(task.category)}</span>
                    <span class="task-date">Créée le ${formatDate(task.created_at)}</span>
                    <span class="task-status ${task.completed ? 'completed' : 'pending'}">
                        ${task.completed ? '✅ Terminée' : '⏳ En attente'}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-toggle" onclick="toggleTask(${task.id})">
                    ${task.completed ? '✏️ Réouvrir' : '✅ Terminer'}
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');
    
    // Mettre à jour le conteneur
    tasksContainer.innerHTML = tasksHTML;
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
function showError(message) {
    titleError.textContent = message;
    titleError.style.display = 'block';
    taskTitleInput.style.borderColor = '#e74c3c';
    taskTitleInput.focus();
}

function showSuccessMessage(message) {
    // Créer un message temporaire
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successMsg);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 300);
    }, 3000);
}


async function createTask() {
    console.log('➕ Tentative de création d\'une tâche...');
    
    // Récupérer les valeurs du formulaire
    const title = taskTitleInput.value.trim();
    const category = taskCategoryInput.value.trim();
    
    // Validation basique
    if (!title) {
        showError('Le titre est obligatoire');
        return;
    }
    
    try {
        // Désactiver le bouton pendant l'envoi
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création en cours...';
        
        // Préparer les données pour l'API
        const taskData = {
            title: title,
            category: category || 'Non catégorisée'  // Valeur par défaut
        };
        
        console.log('📤 Envoi à l\'API:', taskData);
        
        // Envoyer la requête POST
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        // Vérifier la réponse
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }
        
        // Parser la réponse
        const result = await response.json();
        
        console.log('✅ Tâche créée:', result.data);
        
        // Fermer la modal
        taskModal.style.display = 'none';
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Recharger la liste des tâches
        await loadTasks();
        
        // Afficher un message de succès temporaire
        showSuccessMessage('Tâche créée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
        showError(`Erreur: ${error.message}`);
        
    } finally {
        // Réactiver le bouton
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer la tâche';
    }
}

// Fonction utilitaire pour échapper le HTML (sécurité)
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initApp);

