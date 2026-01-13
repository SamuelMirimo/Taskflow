//importation des modules 
const express = require('express');
const router = express.Router();

//importation des fonctions du controlleur 
const taskController = require('../controller/taskController');

//liste toutes les taches
router.get('/', taskController.getAllTasks);

//recupere une tache par son id 
router.get('/:id', taskController.getTaskById);

//cree une nouvelle tache 
router.post('/', taskController.createTask);

//met a jour une tache existante
router.put('/:id', taskController.updateTask);

//supprime une tache 
router.delete('/:id', taskController.deleteTask);

//exportation du router
module.exports = router;