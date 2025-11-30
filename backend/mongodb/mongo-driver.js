const { MongoClient } = require('mongodb');

let client = null;
let db = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<MongoClient>} MongoDB client instance
 */
async function connectToDatabase() {
    try {
        // If already connected, return existing client
        if (client) {
            try {
                await client.db('admin').command({ ping: 1 });
                return client;
            } catch (e) {
                // Connection lost, will reconnect below
                client = null;
                db = null;
            }
        }

        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.MONGODB_DB_NAME || 'life-coach';

        // MongoDB driver v7+ doesn't need useNewUrlParser and useUnifiedTopology
        client = new MongoClient(uri);

        await client.connect();
        db = client.db(dbName);
        
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📦 Database: ${dbName}`);
        
        return client;
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

/**
 * Get database instance
 * @returns {Db} MongoDB database instance
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase() first.');
    }
    return db;
}

/**
 * Get collection
 * @param {string} collectionName - Name of the collection
 * @returns {Collection} MongoDB collection instance
 */
function getCollection(collectionName) {
    const database = getDatabase();
    return database.collection(collectionName);
}

/**
 * Close MongoDB connection
 */
async function closeConnection() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
        client = null;
        db = null;
    }
}

module.exports = {
    connectToDatabase,
    getDatabase,
    getCollection,
    closeConnection
};