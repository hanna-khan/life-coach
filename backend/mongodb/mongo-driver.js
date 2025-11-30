import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient('mongodb://localhost');
const db = client.db('luke_database');
const usersCollection = db.collection('users');
const blogsCollection = db.collection('blogs');
const bookingsCollection = db.collection('bookings');
const contactsCollection = db.collection('contacts');

// usersCollection.insertOne({ name: 'Hania Imran', email: 'haniaimran@gmail.com' });
// usersCollection.insertMany([
//     { name: 'Effham Ather', email: 'effhamatharva@gmail.com' },
//     { name: 'Anam Sheikh', email: 'anamsheikh@gmail.com' },
//     { name: 'Ayesha Sheikh', email: 'ayeshaseheikh@gmail.com' },
//     { name: 'Ayesha Sheikh', email: 'ayeshaseheikh@gmail.com' },
// ]);

const users = await usersCollection.find().toArray();
console.log(users);



blogsCollection.insertOne({ title: 'Blog Post 1', content: 'This is a blog post' });
bookingsCollection.insertOne({ clientName: 'Effham Ather', clientEmail: 'effhamatharva@gmail.com', clientPhone: '1234567890' });
contactsCollection.insertOne({ name: 'Effham Ather', email: 'effhamatharva@gmail.com', subject: 'Subject', message: 'Message' });

export async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

export default connectToDatabase;