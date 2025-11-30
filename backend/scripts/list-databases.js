require('dotenv').config();
const { MongoClient } = require('mongodb');

async function listDatabases() {
    let client = null;
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        
        console.log('🔄 Connecting to MongoDB...');
        console.log(`📍 Connection URI: ${uri}\n`);
        
        client = new MongoClient(uri);
        await client.connect();
        
        console.log('✅ Connected successfully!\n');
        
        // List all databases
        const adminDb = client.db().admin();
        const databasesList = await adminDb.listDatabases();
        
        console.log('📊 Available Databases:\n');
        databasesList.databases.forEach((db, index) => {
            console.log(`${index + 1}. ${db.name}`);
            console.log(`   Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Empty: ${db.empty ? 'Yes' : 'No'}\n`);
        });
        
        // Check specific database
        const dbName = process.env.MONGODB_DB_NAME || 'life-coach';
        const db = client.db(dbName);
        
        console.log(`\n🔍 Checking database: "${dbName}"\n`);
        
        // List collections in the database
        const collections = await db.listCollections().toArray();
        
        if (collections.length === 0) {
            console.log(`⚠️  Database "${dbName}" exists but has no collections yet.`);
            console.log('   (This is normal if no data has been inserted)\n');
        } else {
            console.log(`✅ Database "${dbName}" found with ${collections.length} collection(s):\n`);
            
            for (const collection of collections) {
                const collectionObj = db.collection(collection.name);
                const count = await collectionObj.countDocuments();
                console.log(`   📁 ${collection.name}: ${count} document(s)`);
                
                // Show sample document
                if (count > 0) {
                    const sample = await collectionObj.findOne();
                    console.log(`      Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
                }
            }
        }
        
        console.log('\n💡 MongoDB Compass Instructions:');
        console.log(`   1. Open MongoDB Compass`);
        console.log(`   2. Connect to: ${uri}`);
        console.log(`   3. Look for database: "${dbName}"`);
        console.log(`   4. If not visible, click "Refresh" button`);
        console.log(`   5. Click on "${dbName}" to view collections\n`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Make sure MongoDB server is running');
        console.error('   2. Check if connection URI is correct');
        console.error('   3. Verify MongoDB Compass is connected to the same instance');
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Connection closed');
        }
    }
}

listDatabases();

