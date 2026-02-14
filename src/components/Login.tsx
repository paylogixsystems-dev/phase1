import React, { useState } from 'react';
import { Leaf, Lock, User, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (name: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password !== 'admin') {
      setError('Incorrect password');
      return;
    }

    onLogin(name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AgroScan AI</h1>
            <p className="text-green-50 text-sm">Smart Crop Analysis System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1"></p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
            </button>
          </form>

          {/* Features */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">AI</div>
                <div className="text-xs text-gray-600 mt-1">Powered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">தமிழ்</div>
                <div className="text-xs text-gray-600 mt-1">Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-xs text-gray-600 mt-1">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/80 text-sm mt-6">
          Helping farmers grow better crops 🌾
        </p>
      </div>
    </div>
  );
};

export default Login;