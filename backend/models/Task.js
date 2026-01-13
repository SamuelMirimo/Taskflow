//importation des modules 
const {pool} = require('../config/db');

//ici nous avous toutes les fonctions qui communique avec la DB (table)

//recupere toutes les taches 
const findAll = async () => {
    const[tasks] = await pool.query(
        `SELECT id, title, description, category, completed,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
        FROM tasks
        ORDER BY created_at DESC`
    );
    return tasks;
};

//recuperer une tache par son id 
const findById = async (id) => {
    const [tasks] = await pool.query(
        `SELECT id, title, description, category, completed,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
        FROM tasks
        WHERE id = ?`,
        [id]
    );

    //si on trouve une tache, retourne le premier element sinon null
    return tasks.length > 0 ? tasks[0] : null;
};

//creer une nouvelle tache
const create = async (taskData) => {
    const { title, description, category } = taskData;

    const [result] = await pool.query(
        `INSERT INTO tasks (title, decription, category, completed)
        VALUES (?, ?, ?, ?)`,
        [
            title.trim(),
            description || null,
            category || 'non categorisée',
            false 
        ]
    );

    //retourne l'ID de la nouvelle taches
    return result.insertId;
};

//mettre a jour une tache existante
const update = async (id, taskData) => {
    const { title, description, category, completed } = taskData;

    //on construit dynamiquement la requette UPDATE
    const updates = [];
    const values = [];

    if (title !== undefined) {
        updates.push('title = ?');
        values.push(title.trim());
    }

    if (description !== undefined) {
        updates.push('description = ?');
        values.push(description || null);
    }

    if (category !== undefined) {
        updates.push('category = ?');
        values.push(category.trim());
    }

    if (completed !== undefined) {
        updates.push('completed = ?');
        values.push(completed)
    }

    //s'il y a rien a mettre a jour, on fait rien
    if (updates.length === 0) {
        return 0; 
    }

    //ajouter l'id pour WHERE
    values.push(id);

    const [result] = await pool.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    //retourne les lignes affectées
    return result.affectedRows;
};

//supprimer une taches 
const remove = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM tasks WHERE id = ?`,
        [id]
    );

    //retourne les lignes supprimées
    return result.affectedRows;

};

//verifier si une tache existe
const exists = async (id) => {
    const [rows] = await pool.query(
        `SELECT 1 FROM tasks WHERE id = ?`,
        [id]
    );

    //retourne le resultat
    return rows.length > 0;
};

//exportation des modules 
module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
    exists
};