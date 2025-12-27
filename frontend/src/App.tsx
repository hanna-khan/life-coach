import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx';
import { StripeProvider } from './contexts/StripeContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import PageTransition from './components/Animation/PageTransition.tsx';

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
import AdminLogin from './pages/AdminLogin.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminBlogs from './pages/admin/Blogs.tsx';
import AdminBookings from './pages/admin/Bookings.tsx';
import AdminContacts from './pages/admin/Contacts.tsx';
import BookingSuccess from './pages/BookingSuccess.tsx';
import BookingCancel from './pages/BookingCancel.tsx';
import Resources from './pages/Resources.tsx';
import Privacy from './pages/Privacy.tsx';
import FAQ from './pages/FAQ.tsx';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx';
import AdminLayout from './components/Admin/AdminLayout.tsx';
import Pricing from './pages/admin/Pricing.tsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <StripeProvider>
          <Router>
            <Routes>
              {/* Public Routes with Navbar and Footer */}
              <Route path="/*" element={
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={
                        <PageTransition>
                          <Home />
                        </PageTransition>
                      } />
                      <Route path="/about" element={
                        <PageTransition>
                          <About />
                        </PageTransition>
                      } />
                      <Route path="/blog" element={
                        <PageTransition>
                          <Blog />
                        </PageTransition>
                      } />
                      <Route path="/blog/:slug" element={
                        <PageTransition>
                          <BlogPost />
                        </PageTransition>
                      } />
                      <Route path="/book-call" element={
                        <PageTransition>
                          <BookCall />
                        </PageTransition>
                      } />
                      <Route path="/resources" element={
                        <PageTransition>
                          <Resources />
                        </PageTransition>
                      } />
                      <Route path="/contact" element={
                        <PageTransition>
                          <Contact />
                        </PageTransition>
                      } />
                      <Route path="/privacy" element={
                        <PageTransition>
                          <Privacy />
                        </PageTransition>
                      } />
                      <Route path="/faq" element={
                        <PageTransition>
                          <FAQ />
                        </PageTransition>
                      } />
                      <Route path="/login" element={
                        <PageTransition>
                          <Login />
                        </PageTransition>
                      } />
                      <Route path="/register" element={
                        <PageTransition>
                          <Register />
                        </PageTransition>
                      } />
                      <Route path="/admin-login" element={
                        <PageTransition>
                          <AdminLogin />
                        </PageTransition>
                      } />
                      <Route path="/booking/success" element={
                        <PageTransition>
                          <BookingSuccess />
                        </PageTransition>
                      } />
                      <Route path="/booking/cancel" element={
                        <PageTransition>
                          <BookingCancel />
                        </PageTransition>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />

              {/* Admin Routes without Navbar and Footer */}
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                } />
                <Route path="blogs" element={
                  <PageTransition>
                    <AdminBlogs />
                  </PageTransition>
                } />
                <Route path="bookings" element={
                  <PageTransition>
                    <AdminBookings />
                  </PageTransition>
                } />
                <Route path="pricing" element={
                  <PageTransition>
                    <Pricing />
                  </PageTransition>
                } />
                <Route path="contacts" element={
                  <PageTransition>
                    <AdminContacts />
                  </PageTransition>
                } />
              </Route>
            </Routes>
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
          </Router>
          </StripeProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
