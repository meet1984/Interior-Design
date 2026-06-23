import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Route guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RBACRoute } from './routes/RBACRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Public Pages
import { Home } from './pages/Public/Home';
import { About } from './pages/Public/About';
import { Services } from './pages/Public/Services';
import { Projects } from './pages/Public/Projects';
import { Gallery } from './pages/Public/Gallery';
import { Testimonials } from './pages/Public/Testimonials';
import { Contact } from './pages/Public/Contact';
import { Categories } from './pages/Public/Categories';
import { Login } from './pages/Public/Login';
import { Register } from './pages/Public/Register';
import { ForgotPassword } from './pages/Public/ForgotPassword';

// Dashboard Pages
import { AdminDashboard } from './pages/Dashboards/AdminDashboard';
import { ManagerDashboard } from './pages/Dashboards/ManagerDashboard';
import { ClientDashboard } from './pages/Dashboards/ClientDashboard';
import { UserProfile } from './pages/Dashboards/UserProfile';
import { AdminUsers } from './pages/Dashboards/AdminUsers';
import { AdminCategories } from './pages/Dashboards/AdminCategories';
import { AdminCollections } from './pages/Dashboards/AdminCollections';
import { AdminProducts } from './pages/Dashboards/AdminProducts';
import { AdminProjects } from './pages/Dashboards/AdminProjects';
import { AdminGallery } from './pages/Dashboards/AdminGallery';
import { AdminTestimonials } from './pages/Dashboards/AdminTestimonials';
import { AdminLogs } from './pages/Dashboards/AdminLogs';
import { AdminSettings } from './pages/Dashboards/AdminSettings';
import { ManagerInquiries } from './pages/Dashboards/ManagerInquiries';
import { ClientFavorites } from './pages/Dashboards/ClientFavorites';
import { ClientInquiries } from './pages/Dashboards/ClientInquiries';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          
          {/* 1. PUBLIC WEBSITE PAGES */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Hierarchical Categories -> Collections -> Products browsing flow */}
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:categorySlug" element={<Categories />} />
            <Route path="categories/:categorySlug/collections/:collectionSlug" element={<Categories />} />
            
            {/* Auth public forms */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* 2. ADMIN DASHBOARD MANAGEMENT (RBAC: admin) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <RBACRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </RBACRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="inquiries" element={<ManagerInquiries />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* 3. MANAGER DASHBOARD MANAGEMENT (RBAC: manager) */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute>
                <RBACRoute allowedRoles={['manager']}>
                  <DashboardLayout />
                </RBACRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="inquiries" element={<ManagerInquiries />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* 4. CLIENT DASHBOARD PORTAL (RBAC: client) */}
          <Route 
            path="/client" 
            element={
              <ProtectedRoute>
                <RBACRoute allowedRoles={['client']}>
                  <DashboardLayout />
                </RBACRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="saved-designs" element={<ClientFavorites />} />
            <Route path="favorites" element={<ClientFavorites />} />
            <Route path="inquiries" element={<ClientInquiries />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* 5. CATCH-ALL REDIRECT */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
