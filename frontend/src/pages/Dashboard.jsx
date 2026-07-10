import React from 'react';
import { 
  ArrowUpRight, 
  Activity,
  Hospital,
  Car,
  ShieldCheck,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Brand Landing Dashboard
 * Provides the sexy entry point into either the Health or Vehicle portals.
 */
const Dashboard = () => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    navigate(`/${type}/dashboard`);
  };
  
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold uppercase tracking-widest"
        >
          <Zap className="w-4 h-4" />
          <span>Next-Gen Truth Scoring Engine</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-white leading-tight"
        >
          Expose the Truth in <span className="premium-gradient-text">Every Claim.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Leveraging <span className="text-white font-semibold">Contextual Intelligence</span> and AI-driven narrative reconstruction to eliminate insurance fraud at the source.
        </motion.p>
      </div>

      {/* The Two Sexy Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('health')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-2xl"></div>
          <div className="glass-card p-10 border-2 border-transparent group-hover:border-primary/50 transition-all relative z-10 h-full flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
              <Hospital className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Health Insurance</h2>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              Validate medical narratives, hospital relationships, and diagnosis consistency using Amazon Bedrock.
            </p>
            <div className="mt-auto flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
              Enter Portal <ArrowUpRight className="ml-2 w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('vehicle')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-2xl"></div>
          <div className="glass-card p-10 border-2 border-transparent group-hover:border-secondary/50 transition-all relative z-10 h-full flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all duration-500">
              <Car className="w-10 h-10 text-secondary group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Vehicle Insurance</h2>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              Analyze accident scene dynamics, location history, and damage reports through contextual cross-referencing.
            </p>
            <div className="mt-auto flex items-center text-secondary font-bold group-hover:translate-x-2 transition-transform">
              Enter Portal <ArrowUpRight className="ml-2 w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <motion.div whileHover={{ y: -5 }} className="p-6 space-y-4 hover:bg-zinc-900/50 rounded-2xl transition-colors">
          <h4 className="text-white font-bold text-lg flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary mr-3 shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
            Narrative Reconstruction
          </h4>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Our AI doesn't just read data; it reconstructs the entire story of a claim to identify logical inconsistencies.
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="p-6 space-y-4 hover:bg-zinc-900/50 rounded-2xl transition-colors">
          <h4 className="text-white font-bold text-lg flex items-center">
            <div className="w-2 h-2 rounded-full bg-secondary mr-3 shadow-[0_0_10px_rgba(8,145,178,0.8)]"></div>
            Vector Similarity Search
          </h4>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Detect organized fraud rings by identifying mathematical similarities with thousands of historical fraud cases.
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="p-6 space-y-4 hover:bg-zinc-900/50 rounded-2xl transition-colors">
          <h4 className="text-white font-bold text-lg flex items-center">
            <div className="w-2 h-2 rounded-full bg-success mr-3 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            Explainable AI (XAI)
          </h4>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Every decision comes with a human-readable explanation, ensuring transparency for adjusters and legal teams.
          </p>
        </motion.div>
      </div>

      {/* Trusted By Section */}
      <div className="pt-12 border-t border-zinc-800/50">
        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Trusted by Global Leaders</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center space-x-2">
            <Globe className="w-6 h-6 text-zinc-400" />
            <span className="font-bold text-lg text-zinc-300 tracking-tighter italic">GLOBAL AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-zinc-400" />
            <span className="font-black text-xl text-zinc-300">INSUR<span className="text-zinc-500">CO</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-zinc-400" />
            <span className="font-serif text-lg text-zinc-300">PrimeHealth</span>
          </div>
          <div className="flex items-center space-x-2 font-mono">
            <Activity className="w-6 h-6 text-zinc-400" />
            <span className="text-zinc-300">ZENITH.TECH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
