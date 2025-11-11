import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import KnowledgebaseSearch from './pages/KnowledgebaseSearch';
import CustomerDiscovery from './pages/CustomerDiscovery';
import Settings from './pages/Settings';
import { useConfigStore } from './store/configStore';

function App() {
  const loadConfig = useConfigStore((state) => state.loadConfig);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<KnowledgebaseSearch />} />
          <Route path="/discovery" element={<CustomerDiscovery />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

