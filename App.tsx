
// Test comment
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { isSupabaseConfigured } from './services/supabaseClient';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Plans } from './pages/Plans';
import { Rewards } from './pages/Rewards';
import { Coupons } from './pages/Coupons';
import { Blog } from './pages/Blog';
import { Marketplace } from './pages/Marketplace';
import { Quotes } from './pages/Quotes';
import { Reviews } from './pages/Reviews';
import { Categories } from './pages/Categories';
import { MyCatalog } from './pages/MyCatalog';
import { StoreView } from './pages/StoreView';
import { Vitrine } from './pages/Vitrine';
import { BioBuilder } from './pages/BioBuilder';
import { BioView } from './pages/BioView';
import { BusinessSuite } from './pages/BusinessSuite';
import { MarketplaceB2B } from './pages/MarketplaceB2B';
import { Academy } from './pages/Academy';
import { AboutUs } from './pages/AboutUs';
import { Partners } from './pages/Partners';
import { Events } from './pages/Events';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { Support } from './pages/Support';
import { ProjectManagement } from './pages/ProjectManagement';
import { ContentManagement } from './pages/ContentManagement';
import { AdminCentral } from './pages/AdminCentral';
import { LocalPlus } from './pages/LocalPlus';
import { Mentoria } from './pages/Mentoria';
import { DirectMessages } from './pages/DirectMessages';

import { ProtectedRoute } from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<Layout children={<Home />} />} path="/" />
      <Route element={<Layout children={<Categories />} />} path="/categories" />
      <Route element={<Navigate to="/vitrine" replace />} path="/stores" />
      <Route element={<Layout children={<Vitrine />} />} path="/vitrine" />
      <Route element={<StoreView />} path="/store/:user_id" />
      <Route element={<BioView />} path="/bio/:user_id" />
      <Route element={<Layout children={<Coupons />} />} path="/coupons" />
      <Route element={<Layout children={<Login />} />} path="/login" />
      <Route element={<Layout children={<Register />} />} path="/register" />
      <Route element={<Layout children={<Blog />} />} path="/blog" />
      <Route element={<Layout children={<Blog />} />} path="/blog/:id" />
      <Route element={<Layout children={<Marketplace />} />} path="/marketplace" />
      <Route element={<Layout children={<AboutUs />} />} path="/quem-somos" />
      <Route element={<Layout children={<Partners />} />} path="/partners" />
      <Route element={<Layout children={<Events />} />} path="/eventos" />
      <Route element={<Layout children={<Plans />} />} path="/plans" />
      <Route element={<Layout children={<Plans />} />} path="/planos" />
      <Route element={<Layout children={<PrivacyPolicy />} />} path="/privacidade" />
      <Route element={<Layout children={<TermsOfUse />} />} path="/termos" />

      {/* Dashboard Routes - Wrapped in ProtectedRoute and DashboardLayout */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/business-suite" element={<ProtectedRoute><DashboardLayout><BusinessSuite /></DashboardLayout></ProtectedRoute>} />
      <Route path="/project-management" element={<ProtectedRoute><DashboardLayout><ProjectManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/content-management" element={<ProtectedRoute><DashboardLayout><ContentManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/marketplace-b2b" element={<ProtectedRoute><DashboardLayout><MarketplaceB2B /></DashboardLayout></ProtectedRoute>} />
      <Route path="/academy" element={<ProtectedRoute><DashboardLayout><Academy /></DashboardLayout></ProtectedRoute>} />
      <Route path="/menuclub" element={<ProtectedRoute><DashboardLayout><LocalPlus /></DashboardLayout></ProtectedRoute>} />
      <Route path="/bio-builder" element={<ProtectedRoute><DashboardLayout><BioBuilder /></DashboardLayout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><MyCatalog /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><DashboardLayout><Rewards /></DashboardLayout></ProtectedRoute>} />
      <Route path="/quotes" element={<ProtectedRoute><DashboardLayout><Quotes /></DashboardLayout></ProtectedRoute>} />
       <Route path="/reviews" element={<ProtectedRoute><DashboardLayout><Reviews /></DashboardLayout></ProtectedRoute>} />
       <Route path="/support" element={<ProtectedRoute><DashboardLayout><Support /></DashboardLayout></ProtectedRoute>} />
       <Route path="/mentoria" element={<ProtectedRoute><DashboardLayout><Mentoria /></DashboardLayout></ProtectedRoute>} />
       <Route path="/messages" element={<ProtectedRoute><DashboardLayout><DirectMessages /></DashboardLayout></ProtectedRoute>} />
      
      {/* Admin Route - Admin restriction */}
      <Route path="/admin-central" element={<ProtectedRoute requireAdmin={true}><DashboardLayout><AdminCentral /></DashboardLayout></ProtectedRoute>} />
      
      {/* Vanity URL / Slug - Must be last */}
      <Route element={<StoreView />} path="/:slug" />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      {!isSupabaseConfigured && (
        <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-[9999]">
          <p className="font-bold">Supabase não configurado!</p>
          <p className="text-sm">Por favor, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no menu de Configurações.</p>
        </div>
      )}
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
