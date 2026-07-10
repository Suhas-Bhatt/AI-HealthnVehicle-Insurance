import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';

/**
 * Auth Page: Premium Login with Rainbow Mesh Background & Theme Toggle
 */
const Auth = ({ onLogin, isDark, toggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Use environment variables for the API URL
  const API_BASE_URL = import.meta.env.VITE_AWS_API_URL || 'https://ud5njouxc9.execute-api.us-east-1.amazonaws.com/prod';
  const API_URL_LOGIN = `${API_BASE_URL}/login`;
  const API_URL_SIGNUP = `${API_BASE_URL}/signup`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isLogin ? API_URL_LOGIN : API_URL_SIGNUP;
      const payload = isLogin ? { email, password } : { email, password, name };

      // Call AWS Lambda via API Gateway
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      if (isLogin) {
        // Success: Only log them in if they actually clicked Login
        onLogin(data.name || email.split('@')[0]);
      } else {
        // Success: If they just signed up, switch the UI back to the Login form
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Signup successful! Please log in.', type: 'success' } }));
        setIsLogin(true);
        setPassword(''); // Clear the password field for security
      }
      
    } catch (error) {
      console.error("AWS Auth Error:", error);
      
      // Fallback for Demo Purposes if API Gateway URL isn't configured yet
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
         console.warn("API Gateway not reachable. Falling back to Mock Login for Demo.");
         onLogin(isLogin ? "Suhas (Mock API)" : name);
      } else {
         // Show error toast for validation failures (e.g., password too short)
         window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'error' } }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-700 ${isDark ? 'bg-[#0a0a0f]' : 'bg-[#f4f7fa]'}`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-2xl border transition-all duration-300 shadow-lg flex items-center justify-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-primary-light hover:bg-zinc-800' : 'bg-black border-slate-200 text-primary hover:bg-slate-50'}`}
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* 7 Rainbow Colors Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[-5%] right-[10%] w-[35%] h-[35%] bg-orange-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-yellow-300/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[20%] w-[45%] h-[45%] bg-green-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[20%] w-[35%] h-[35%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[40%] w-[35%] h-[35%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6 border transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-black border-slate-100'}`}
          >
            <ShieldCheck className={`w-8 h-8 ${isDark ? 'text-primary-light' : 'text-primary'}`} />
          </motion.div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-primary'}`}>AI Insurance</h1>
          <p className={`font-medium tracking-wide text-sm transition-colors duration-500 ${isDark ? 'text-zinc-400' : 'text-primary/60'}`}>"Intelligence Beyond the Claim"</p>
        </div>

        {/* Auth Card (Premium Glassmorphism) */}
        <div className={`backdrop-blur-3xl border shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-zinc-900/80 border-zinc-800/50 shadow-primary/5' : 'bg-black/80 border-white shadow-slate-200/60'}`}>
          
          {/* Subtle inner top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

          {/* Toggle Switches */}
          <div className={`flex p-1.5 rounded-2xl mb-8 border relative transition-colors duration-500 ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-slate-200/50'}`}>
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 ${isLogin ? (isDark ? 'text-white' : 'text-primary') : (isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-slate-400 hover:text-primary/60')}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 ${!isLogin ? (isDark ? 'text-white' : 'text-primary') : (isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-slate-400 hover:text-primary/60')}`}
            >
              Register
            </button>
            
            {/* Animated Highlight Pill */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl shadow-md border transition-all duration-500 ease-in-out ${isDark ? 'bg-zinc-800 border-zinc-700 shadow-black/20' : 'bg-black border-slate-200 shadow-slate-100'}`}
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className={`w-full border rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium text-sm shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800 text-white focus:bg-zinc-950' : 'bg-black border-slate-200 text-slate-800 focus:bg-black shadow-slate-100'}`} 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                placeholder="Work Email (@gmail.com)" 
                className={`w-full border rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium text-sm shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800 text-white focus:bg-zinc-950' : 'bg-black border-slate-200 text-slate-800 focus:bg-black shadow-slate-100'}`} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="Password (min 6 chars)" 
                className={`w-full border rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium text-sm shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800 text-white focus:bg-zinc-950' : 'bg-black border-slate-200 text-slate-800 focus:bg-black shadow-slate-100'}`} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(false);
                  }}
                  className={`text-xs font-bold transition-colors ${isDark ? 'text-primary-light hover:text-white' : 'text-primary hover:text-primary/70'}`}
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`w-full rounded-2xl py-4 font-bold transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-4 text-white ${isDark ? 'bg-primary hover:bg-primary-dark shadow-primary/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Access Portal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isLogin && (
              <button 
                type="button" 
                onClick={() => onLogin("Guest User")} 
                className={`w-full rounded-2xl py-3 font-semibold transition-all border active:scale-[0.98] flex items-center justify-center space-x-2 mt-3 text-sm ${
                  isDark 
                    ? 'bg-zinc-800/40 border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>Skip Login (Demo Mode)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        <p className={`text-center mt-8 text-xs font-medium transition-colors duration-500 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          By continuing, you agree to AI Insurance's <br/>
          <a href="#" className={`transition-colors underline underline-offset-4 font-semibold ${isDark ? 'text-zinc-400 hover:text-primary-light decoration-zinc-700' : 'text-slate-700 hover:text-primary decoration-slate-300'}`}>Terms of Use</a> and <a href="#" className={`transition-colors underline underline-offset-4 font-semibold ${isDark ? 'text-zinc-400 hover:text-primary-light decoration-zinc-700' : 'text-slate-700 hover:text-primary decoration-slate-300'}`}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
