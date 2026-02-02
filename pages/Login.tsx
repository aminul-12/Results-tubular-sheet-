import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { School, User, Shield, GraduationCap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email);
    setLoading(false);
  };

  const setDemoUser = (roleEmail: string) => {
    setEmail(roleEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <School size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to UniGrade</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to access the examination portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter your university email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3 text-center">Quick Login (Demo)</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setDemoUser('admin@uni.edu')} className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded hover:border-blue-400 transition-colors">
              <Shield size={20} className="text-purple-600 mb-1"/>
              <span className="text-xs text-gray-600">Admin</span>
            </button>
            <button onClick={() => setDemoUser('prof.smith@uni.edu')} className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded hover:border-blue-400 transition-colors">
              <User size={20} className="text-blue-600 mb-1"/>
              <span className="text-xs text-gray-600">Teacher</span>
            </button>
            <button onClick={() => setDemoUser('alice@uni.edu')} className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded hover:border-blue-400 transition-colors">
              <GraduationCap size={20} className="text-green-600 mb-1"/>
              <span className="text-xs text-gray-600">Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};