import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Coffee, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Credentials Configuration
    const accounts = {
      'admin': 'meyastra2026',
      'staff': 'staff2026'
    };

    if (accounts[username] && accounts[username] === password) {
      localStorage.setItem('user', JSON.stringify({ username, role: username }));
      toast.success(`Welcome back, ${username}!`);
      
      // Redirect based on role
      if (username === 'admin') navigate('/');
      else if (username === 'staff') navigate('/');
    } else {
      toast.error('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden text-gray-100">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] relative z-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-600/40 mb-4 rotate-3">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">Mey Astra</h1>
          <p className="text-gray-500 text-sm font-medium">Shop Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="admin or staff"
                className="w-full bg-dark-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary-500 outline-none transition-all placeholder:text-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary-500 outline-none transition-all placeholder:text-gray-700"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98] group"
          >
            Sign In to POS
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8">
           <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative bg-dark-800 px-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Or Access Menu</span>
           </div>
           
           <button 
             onClick={() => {
               const guestUser = { username: 'Guest', role: 'guest' };
               localStorage.setItem('user', JSON.stringify(guestUser));
               navigate('/menu');
             }}
             className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
           >
              <Coffee size={20} className="text-primary-500" />
              Browse as Customer
           </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
           <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
