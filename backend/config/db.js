//importation du driver MySQL
const mysql = require('mysql2/promise');

//confguration de la connexion a la DB
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskflow_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20, // Nombre maximum de connexions simultanées
    queueLimit: 0
};

//creation du pool de connexion
const pool = mysql.createPool(dbConfig);

/*un pool facilite la connexion, au lieu de connect/disconnect a chaque fois, il suffit de se connecter une fois
et prendre un pool(getConnection) et le rendre(release) quand on finit*/

//test de connexion 
async function testConnection() {

    let connection;
    try {

        //prendre un pool de connexion
        connection = await pool.getConnection();

        //requette simple pour tester la connexion
        const [rows] = await connection.query('SELECT NOW() as currentTime');

        console.log('Connexion a MySQL établie !!!');
        console.log(`heure du serveur est : ${rows[0].currentTime}`);

        return true;

    }catch (error) {
        console.error('Erreur de connexion a MySQL :', error.message);
        console.log('verifie : wamp et les identifiants .env');

        return false;

    }finally{

        //liberer le pool quoi qu'il arrive
        if(connection) connection.release();
    }
}

//exportation des modules
module.exports = {
    pool,
    testConnection
}