import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Camera, History as HistoryIcon, LogOut, User } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import History from './components/History';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Inspection } from './types';

const Navigation = ({ userName, onLogout }: { userName: string; onLogout: () => void }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const userInitial = userName.charAt(0).toUpperCase();
  
  return (
    <>
      {/* Top Bar with User Profile */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-800">AgroScan AI</h1>
          
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
              <span className="text-sm font-semibold text-green-900">{userName}</span>
            </button>

            {/* Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500">Farmer</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 shadow-lg z-50">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive('/') ? 'bg-green-100 text-green-700' : 'text-gray-500'
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-xs font-semibold">Dashboard</span>
            </Link>
            
            <Link
              to="/scan"
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive('/scan') ? 'bg-green-100 text-green-700' : 'text-gray-500'
              }`}
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-semibold">Scan</span>
            </Link>
            
            <Link
              to="/history"
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive('/history') ? 'bg-green-100 text-green-700' : 'text-gray-500'
              }`}
            >
              <HistoryIcon className="w-6 h-6" />
              <span className="text-xs font-semibold">History</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

const ConfigError = () => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-bold text-red-900 mb-4">Configuration Missing</h2>
      <div className="text-left bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-6">
        <p className="font-semibold text-gray-700">Required Environment Variables:</p>
        <code className="block text-xs bg-white p-2 rounded border">VITE_CLAUDE_API_KEY</code>
        <code className="block text-xs bg-white p-2 rounded border">VITE_SUPABASE_URL</code>
        <code className="block text-xs bg-white p-2 rounded border">VITE_SUPABASE_ANON_KEY</code>
      </div>
      <p className="text-sm text-gray-600">
        Create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project root with these variables.
      </p>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('agroscan_auth') === 'true'
  );
  const [userName, setUserName] = useState(() => 
    localStorage.getItem('agroscan_user') || ''
  );
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const isConfigured = isSupabaseConfigured && !!import.meta.env.VITE_CLAUDE_API_KEY;

  useEffect(() => {
    if (isAuthenticated && supabase) {
      fetchInspections();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchInspections = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsAuthenticated(true);
    localStorage.setItem('agroscan_auth', 'true');
    localStorage.setItem('agroscan_user', name);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    localStorage.removeItem('agroscan_auth');
    localStorage.removeItem('agroscan_user');
  };

  const handleAnalysisComplete = (inspection: Inspection) => {
    setInspections(prev => [inspection, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInspections(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete inspection');
    }
  };

  const handleViewDetails = (inspection: Inspection) => {
    // This is handled by the History component's modal
  };

  if (!isConfigured) {
    return <ConfigError />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation userName={userName} onLogout={handleLogout} />
        <main className="pb-20 pt-16">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  inspections={inspections}
                  userName={userName}
                  onViewDetails={handleViewDetails}
                />
              } 
            />
            <Route 
              path="/scan" 
              element={
                <Scanner 
                  userName={userName} 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              } 
            />
            <Route 
              path="/history" 
              element={
                <History 
                  inspections={inspections}
                  onDelete={handleDelete}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;