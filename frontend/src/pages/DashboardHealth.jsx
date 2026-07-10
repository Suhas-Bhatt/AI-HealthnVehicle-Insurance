import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Activity,
  UserCheck,
  ShieldAlert,
  Hospital
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Analytical Dashboard for Health Insurance
 * Focused on medical narratives, diagnosis consistency, and hospital relationships.
 */
const DashboardHealth = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Health Claims', value: '2,845', change: '+12%', icon: Hospital, color: 'text-primary' },
    { label: 'Avg Truth Score', value: '84%', change: '+5%', icon: UserCheck, color: 'text-success' },
    { label: 'High Risk Flagged', value: '42', change: '+18%', icon: AlertTriangle, color: 'text-warning' },
    { label: 'Detected Fraud', value: '18', change: '-4%', icon: ShieldAlert, color: 'text-danger' },
  ];

  const recentClaims = [
    { id: 'CLM-955FFE61', hospital: 'Fortis', disease: 'Fracture', type: 'Injury', risk: '0.88', status: 'Flagged', flags: 'Suspicious Amount' },
    { id: 'CLM-D105E64A', hospital: 'Fortis', disease: 'Fracture', type: 'Injury', risk: '0.91', status: 'Flagged', flags: 'Suspicious Amount' },
    { id: 'CLM-1594FC94', hospital: 'Fortis', disease: 'Diabetes', type: 'Chronic', risk: '0.74', status: 'Flagged', flags: 'Suspicious Amount' },
    { id: 'CLM-375CE5B9', hospital: 'City Care', disease: 'Appendicitis', type: 'Acute', risk: '0.12', status: 'Approved', flags: 'None' },
    { id: 'CLM-C88AA26D', hospital: 'City Care', disease: 'Migraine', type: 'Moderate', risk: '0.85', status: 'Flagged', flags: 'Frequent Claimant' },
    { id: 'CLM-93EE2BDA', hospital: 'City Care', disease: 'Fracture', type: 'Injury', risk: '0.89', status: 'Flagged', flags: 'Suspicious Amount' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-primary-light mb-1">
             <Hospital className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Health Insurance Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Medical Intelligence</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center group bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-800"
        >
          Change Portal <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="stat-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-zinc-800/50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-zinc-800 ${stat.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-zinc-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 glass-card overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/30">
            <h3 className="text-lg font-bold flex items-center text-white">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Recent Analysis
            </h3>
            <button className="text-xs text-primary hover:text-primary-light transition-colors">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">Hospital</th>
                  <th className="px-6 py-4">Disease</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {recentClaims.map((claim, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-zinc-300">{claim.id}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-medium">{claim.hospital}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${claim.type === 'Injury' ? 'bg-warning/10 text-warning' : 'bg-zinc-800 text-zinc-400'}`}>
                        {claim.disease}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-2">
                         <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[60px]">
                           <div 
                             className={`h-full rounded-full ${parseFloat(claim.risk) > 0.8 ? 'bg-danger' : 'bg-success'}`}
                             style={{ width: `${parseFloat(claim.risk) * 100}%` }}
                           />
                         </div>
                         <span className="text-[10px] text-zinc-500">{claim.risk}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold ${claim.status === 'Approved' ? 'text-success' : 'text-warning'}`}>{claim.status}</span>
                        <span className="text-[9px] text-zinc-600 truncate max-w-[100px]">{claim.flags}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 hover:border-zinc-700 transition-colors relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]"></div>
          <h3 className="text-lg font-bold mb-6 flex items-center text-white relative z-10">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Diagnosis Alerts
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 hover:bg-danger/10 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-2 mb-1">
                <ShieldAlert className="w-3 h-3 text-danger" />
                <span className="text-[10px] font-bold text-danger uppercase tracking-tighter">Treatment Anomaly</span>
              </div>
              <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 leading-relaxed">
                Fortis Hospital reported a 13-day stay for "Diabetes" which is statistically 40% higher than peer averages.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-primary-light" />
                <span className="text-[10px] font-bold text-primary-light uppercase tracking-tighter">Frequent Hospitalizations</span>
              </div>
              <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 leading-relaxed">
                 USR-10010 at City Care shows 3 separate Migraine claims in 60 days. Risk score elevated.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHealth;
