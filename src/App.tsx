import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import KnowledgebaseSearch from './pages/KnowledgebaseSearch';
import CustomerDiscovery from './pages/CustomerDiscovery';
import Settings from './pages/Settings';
import DiscoveryResults from './pages/DiscoveryResults';
import Login from './pages/Login';
import { useConfigStore } from './store/configStore';
import { useAuthStore } from './store/authStore';

function ProtectedLayout() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Wait for auth to initialize before redirecting
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const loadConfig = useConfigStore((state) => state.loadConfig);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const authInitialized = useAuthStore((state) => state.isInitialized);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Only load config after authentication is initialized and user is logged in
  useEffect(() => {
    if (authInitialized && currentUser) {
      loadConfig();
    }
  }, [authInitialized, currentUser, loadConfig]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Initializing...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<KnowledgebaseSearch />} />
          <Route path="/discovery" element={<CustomerDiscovery />} />
          <Route path="/results" element={<DiscoveryResults />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

