//importation des modules 
const express = require('express');
require('dotenv').config();
const {pool, testConnection} = require('./config/db');

//initialisation de l'application 
const app = express();
const PORT = process.env.PORT || 5000

//middleware qui parse les requettes en JSON
app.use(express.json());

//route de test
app.get('/', (req, res) => {
    res.json({
        message : 'api de test fonctionne correctement',
        status : 'Success',
        timestamp : new Date().toISOString(),
        database: 'MySQL (WAMP)',
        endpoints: {
        tasks: 'GET /api/tasks',
        health: 'GET /api/health'
        }
    });
});

//route de verification de connexion
app.get('/api/health', async (req, res) => {
    try{
        //test de connexion a la db
        const connection = await pool.getConnection();

        //requette simple pour tester la connexion
        const[result] = await connection.query('SELECT 1 as status');

        //libere la connexion 
        connection.release();

        res.json({
            status : 'healthy',
            timestamp : new Date().toISOString(),
            database : 'connected',
            server : 'running',
            check : result[0].status
        });

    }catch(error) {
        res.status(500).json({
            status : 'unhealthy',
            timestamp : new Date().toISOString(),
            database : 'disconnected',
            error : error.message
        });
    }
});

//demarre le serveur seulement la db est connecte
async function startServer() {
    console.log('test de connexion...');

    const dbConnected = await testConnection();

    if(!dbConnected) {
          console.log(' Impossible de démarrer: MySQL non connecté');

          return;
    }

    //port d'ecoute du serveur 
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
        console.log(` Endpoints disponibles:`);
        console.log(`   GET http://localhost:${PORT}/ - Page d'accueil`);
        console.log(`   GET http://localhost:${PORT}/api/health - Vérification santé`);
        console.log(` Accède à phpMyAdmin: http://localhost/phpmyadmin`);
    });
}

//demarre le serveur 
startServer();
