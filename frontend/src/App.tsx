import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { StripeProvider } from './contexts/StripeContext.tsx';

// Components
import Navbar from './components/Layout/Navbar.tsx';
import Footer from './components/Layout/Footer.tsx';

// Pages
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Blog from './pages/Blog.tsx';
import BlogPost from './pages/BlogPost.tsx';
import BookCall from './pages/BookCall.tsx';
import Contact from './pages/Contact.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminBlogs from './pages/admin/Blogs.tsx';
import AdminBookings from './pages/admin/Bookings.tsx';
import AdminContacts from './pages/admin/Contacts.tsx';
import BookingSuccess from './pages/BookingSuccess.tsx';
import BookingCancel from './pages/BookingCancel.tsx';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx';

function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/book-call" element={<BookCall />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/booking/success" element={<BookingSuccess />} />
                <Route path="/booking/cancel" element={<BookingCancel />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blogs" element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlogs />
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute requireAdmin>
                    <AdminBookings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/contacts" element={
                  <ProtectedRoute requireAdmin>
                    <AdminContacts />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </StripeProvider>
    </AuthProvider>
  );
}

export default App;
