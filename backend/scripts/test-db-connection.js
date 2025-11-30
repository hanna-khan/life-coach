require('dotenv').config();
const { connectToDatabase, getCollection, closeConnection } = require('../mongodb/mongo-driver');

async function testDatabaseConnection() {
    try {
        console.log('🔄 Connecting to MongoDB...\n');
        
        // Connect to database
        await connectToDatabase();
        
        // Get collections
        const usersCollection = getCollection('users');
        const blogsCollection = getCollection('blogs');
        const bookingsCollection = getCollection('bookings');
        const contactsCollection = getCollection('contacts');
        
        console.log('\n📝 Inserting test data...\n');
        
        // Test Users Data
        const testUsers = [
            {
                name: 'Hania Imran',
                email: 'haniaimran@gmail.com',
                role: 'admin',
                createdAt: new Date()
            },
            {
                name: 'Effham Ather',
                email: 'effhamatharva@gmail.com',
                role: 'user',
                createdAt: new Date()
            },
            {
                name: 'Anam Sheikh',
                email: 'anamsheikh@gmail.com',
                role: 'user',
                createdAt: new Date()
            }
        ];
        
        const usersResult = await usersCollection.insertMany(testUsers);
        console.log(`✅ Inserted ${usersResult.insertedCount} users`);
        console.log('   User IDs:', usersResult.insertedIds);
        
        // Test Blogs Data
        const testBlogs = [
            {
                title: 'Test Blog Post 1',
                slug: 'test-blog-post-1',
                excerpt: 'This is a test blog post to verify database connection',
                content: 'This is the full content of the test blog post. It contains detailed information about testing the MongoDB connection.',
                featuredImage: 'https://via.placeholder.com/800x400',
                category: 'Personal Growth',
                tags: ['test', 'database', 'connection'],
                status: 'published',
                publishedAt: new Date(),
                views: 0,
                likes: 0,
                isFeatured: false,
                createdAt: new Date()
            },
            {
                title: 'Test Blog Post 2',
                slug: 'test-blog-post-2',
                excerpt: 'Another test blog post for database verification',
                content: 'This is another test blog post content to ensure multiple entries work correctly.',
                featuredImage: 'https://via.placeholder.com/800x400',
                category: 'Career',
                tags: ['test', 'verification'],
                status: 'draft',
                views: 0,
                likes: 0,
                isFeatured: false,
                createdAt: new Date()
            }
        ];
        
        const blogsResult = await blogsCollection.insertMany(testBlogs);
        console.log(`✅ Inserted ${blogsResult.insertedCount} blogs`);
        console.log('   Blog IDs:', blogsResult.insertedIds);
        
        // Test Bookings Data
        const testBookings = [
            {
                clientName: 'Effham Ather',
                clientEmail: 'effhamatharva@gmail.com',
                clientPhone: '1234567890',
                serviceType: 'Life Coaching Session',
                preferredDate: new Date('2025-02-15'),
                preferredTime: '10:00',
                duration: 60,
                price: 180,
                status: 'pending',
                paymentStatus: 'pending',
                message: 'Test booking for database verification',
                createdAt: new Date()
            },
            {
                clientName: 'Anam Sheikh',
                clientEmail: 'anamsheikh@gmail.com',
                clientPhone: '9876543210',
                serviceType: 'Career Guidance',
                preferredDate: new Date('2025-02-20'),
                preferredTime: '14:00',
                duration: 90,
                price: 220,
                status: 'confirmed',
                paymentStatus: 'paid',
                meetingLink: 'https://meet.example.com/test',
                createdAt: new Date()
            }
        ];
        
        const bookingsResult = await bookingsCollection.insertMany(testBookings);
        console.log(`✅ Inserted ${bookingsResult.insertedCount} bookings`);
        console.log('   Booking IDs:', bookingsResult.insertedIds);
        
        // Test Contacts Data
        const testContacts = [
            {
                name: 'Effham Ather',
                email: 'effhamatharva@gmail.com',
                subject: 'Test Contact Form',
                message: 'This is a test message to verify database connection for contact form',
                createdAt: new Date()
            },
            {
                name: 'Ayesha Sheikh',
                email: 'ayeshaseheikh@gmail.com',
                subject: 'Database Test',
                message: 'Another test contact message for verification',
                createdAt: new Date()
            }
        ];
        
        const contactsResult = await contactsCollection.insertMany(testContacts);
        console.log(`✅ Inserted ${contactsResult.insertedCount} contacts`);
        console.log('   Contact IDs:', contactsResult.insertedIds);
        
        // Verify data by reading it back
        console.log('\n📊 Verifying inserted data...\n');
        
        const totalUsers = await usersCollection.countDocuments();
        const totalBlogs = await blogsCollection.countDocuments();
        const totalBookings = await bookingsCollection.countDocuments();
        const totalContacts = await contactsCollection.countDocuments();
        
        console.log('📈 Collection Counts:');
        console.log(`   Users: ${totalUsers}`);
        console.log(`   Blogs: ${totalBlogs}`);
        console.log(`   Bookings: ${totalBookings}`);
        console.log(`   Contacts: ${totalContacts}`);
        
        // Show sample data
        console.log('\n📋 Sample Data:');
        const sampleUser = await usersCollection.findOne({ email: 'haniaimran@gmail.com' });
        console.log('   Sample User:', {
            name: sampleUser.name,
            email: sampleUser.email,
            role: sampleUser.role
        });
        
        const sampleBlog = await blogsCollection.findOne({ slug: 'test-blog-post-1' });
        console.log('   Sample Blog:', {
            title: sampleBlog.title,
            category: sampleBlog.category,
            status: sampleBlog.status
        });
        
        console.log('\n✅ Database connection test completed successfully!');
        console.log('✅ All test data inserted and verified!\n');
        
    } catch (error) {
        console.error('\n❌ Error during database test:', error);
        console.error('Error details:', error.message);
    } finally {
        // Close connection
        await closeConnection();
        console.log('🔌 Connection closed');
    }
}

// Run the test
testDatabaseConnection();

