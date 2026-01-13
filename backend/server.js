//importation des modules 
const express = require('express');
require('dotenv').config();
const {pool, testConnection} = require('./config/db');

//importation des routes 
const taskRoutes = require('./routes/taskRoutes');


//initialisation de l'application 
const app = express();
const PORT = process.env.PORT || 5000

//middleware qui parse les requettes en JSON
app.use(express.json());

//middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next() //passe au suivant middleware
});

//routes
app.use('/api/tasks', taskRoutes);

//route de racine
app.get('/', (req, res) => {
    res.json({
        message : 'API Taskflow - gestionnaire des taches',
        version : '0.0.1',
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

//middleware de gestion d'erreurs
app.use((error, req, res, next) => {
    console.error('erreur non gerée', error);
    res.status(500).json({
        success : false,
        message : 'Erreur interne du serveur',
        error : process.env.NODE_ENV === 'developement' ? error.message : undefined
    });
});

//route 404 pour les urls non trouve
app.use((req, res, next) => {
    // Vérifie si la réponse a déjà été envoyée
    if (!res.headersSent) {
        res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} non trouvée`
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
        console.log(`API Taskflow disponible sur http://localhost:${PORT}/api/tasks - Page d'accueil`);
    });
}

//demarre le serveur 
startServer();
