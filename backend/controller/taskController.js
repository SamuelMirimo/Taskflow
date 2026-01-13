//importation des modules 
const Task = require ('../models/Task');

//fonction helper pour les messages d'erreurs
const sendError = (res, status, message) => {
    res.status(status).json({
        success : false,
        message : message
    });
};

//fonction helper pour les reponses de success
const sendSuccess = (res, status , message, data = null) => {
    const reponse = {
        success : true,
        message : message
    };

    if (data !== null) {
        reponse.data = data;
    }

    res.status(status).json(reponse);
};


//lister toutes les taches 
const getAllTasks = async (req, res) => {
    console.log('recuperation des toutes les taches');  

    try{
        //on appelle le model pour recuperer les taches 
        const tasks = await Task.findAll();

        sendSuccess(res, 200, `${tasks.length} tache(s) trouvée(s)`, tasks);

    }catch(error) {
        console.error('Erreur dans getAllTasks ', error);
        sendError(res, 500, 'erreur lors de la recuperation des taches');
    }
};

//recuperer une tache par id 
const getTaskById = async (req, res) => {
    const taskId = parseInt(req.params.id);
    console.log(`recherche de la tache #${taskId}`);

    //validation simple 
    if (isNaN(taskId) || taskId <= 0) {
        return sendError(res, 400, 'ID de la tache invalide');
    }

    try{
        //on appelle le model pour chercher la tache
        const task = await Task.findById(taskId);

        if(!task) {
            return sendError(res, 404, `tache #${taskId} non trouvée`);
        }

        sendSuccess(res, 200, 'tache trouvée ', task);

    }catch(error) {
        console.error(`erreur dans getTaskById (${taskId}):`, error);
        sendError(res, 500, 'erreur serveur');
    }
};

//creer une nouvelle tache
const createTask = async (req, res) => {
    console.log('Creation d\'une nouvelle tache');
    console.log('données recues : ', req.body);

    const { title, description, category } = req.body;

    //validation 
    if (!title || title.trim() === '') {
        return sendError(res, 400, 'le titre est obligatoire');
    }

    try{
        //on appelle le model dans Task pour creer la tache 
        const newTaskId = await Task.create({
            title,
            description,
            category
        });

        //on recupere la tache nouvellement crée pour la retourner 
        const newtask = await Task.findById(newTaskId);

        sendSuccess(res, 201, 'tache crée avec success ', newtask);

    }catch(error){
        console.error('erreur dans createTask : ', error);
        sendError(res, 500, 'erreur lors de la creation de la tache');
    }
};

//mettre une tache a jour 
const updateTask = async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    console.log(`Mise a jour de la tache : #${taskId}`);
    console.log('Données de la mise a jour', req.body);

    //validation de l'ID
    if (isNaN(taskId) || taskId <= 0) {
        return sendError(res, 400, 'ID de tache invalide');
    }

    const { title, description, category, completed } = req.body;

    //verifier qu'au moins un champ est fourni
    if(!title && !description && !category && !completed === undefined ) {
        return sendError(res, 400, 'au moins un champ doit etre fournie pour la mise a jour');
    }

    try{
        //d'abord verifier si la tache existe
        const taskExists = await Task.exists(taskId);

        if (!taskExists) {
            return sendError(res, 404, `tache #${taskId} non trouvée`);
        }

        //appelle le model pour mettre a jour 
        const affectedRows = await Task.update(taskId, {
            title,
            description,
            category,
            completed
        });

        //si aucune modification n'a ete effectuee
        if(affectedRows === 0) {
            return sendError(res, 400, 'Aucune modification effectue');
        }

        //recupere la tache qui ete modifiee
        const updateTask = await Task.findById(taskId);

        sendSuccess(res, 200, 'tache mis a jour avec success', updateTask);
    }catch(error) {
        console.error(`erreur dans updateTask (${taskId}) :`,error);
        sendError(res, 500, 'erreur de la mise a jour de la tache');
    }
};

//supprimer une tache 
const deleteTask = async (req, res) => {
    const taskId = parseInt(req.params.id);
    console.log(`suppression de la tache : #${taskId}`);

    //validation de l'ID
    if (isNaN(taskId) || taskId <= 0) {
        return sendError(res, 400, 'Id de tache invalide');
    }

    try{
        //on verifie d'abord si la tache existe
        const task = await Task.findById(taskId);

        if (!task) {
            return sendError(res, 404, `tache #${taskId} non trouvée`);
        }

        //appelle le model pour supprimer la tache
        const affectedRows = await Task.remove(taskId);

        if(affectedRows === 0) {
            return sendError(res, 500, 'erreur lors de la suppression');
        }

        sendSuccess(res, 200, `tache #${taskId} supprimée avec success`, {deleted : taskId});
    }catch(error) {
        console.error(`erreur dans deleteTask #${taskId} :`, error);
        sendError(res, 500, 'erreur de la suppression de la tache');
    }
};

//exportation des toutes les fonctions du controlleur 
module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};