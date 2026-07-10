import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  History,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "./api";

const TruthAnalysisHealth = () => {
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);

  const location = useLocation();
  const claimId = location.state?.claim_id || "CLM-1777281763"; // fallback for testing

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.HEALTH_ANALYSIS,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ claim_id: claimId })
          }
        );

        const data = await response.json();
        let parsed;

        if (data.body) {
          parsed = JSON.parse(data.body);
        } else {
          parsed = data;
        }

        setResult(parsed);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      } finally {
        setTimeout(() => setAnalyzing(false), 1200);
      }
    };

    fetchAnalysis();
  }, [claimId]);

  // 🎨 Verdict color
  const verdictColor =
    (result?.verdict === "LEGITIMATE" || result?.verdict === "APPROVE")
      ? "text-green-400"
      : (result?.verdict === "SUSPICIOUS" || result?.verdict === "REVIEW")
        ? "text-yellow-400"
        : "text-red-400";

  // 🔥 Dynamic dimensions based on the new 9 signals
  const dimensions = result?.signals
    ? [
        {
          name: "Amount vs Norms",
          status: "Financial",
          detail: result.signals.AmountCheck || "Evaluated",
          icon: Zap,
          score: result.signals.AmountCheck?.includes("Risk") || result.signals.AmountCheck?.includes("High") ? 30 : 95,
          color: "text-blue-400"
        },
        {
          name: "Diagnosis Check",
          status: "Medical",
          detail: result.signals.DiagnosisCheck || "Evaluated",
          icon: ShieldCheck,
          score: result.signals.DiagnosisCheck?.includes("Mismatch") || result.signals.DiagnosisCheck?.includes("Risk") ? 20 : 98,
          color: "text-green-400"
        },
        {
          name: "Fraud History",
          status: "History",
          detail: result.signals.HistoryCheck || "Evaluated",
          icon: History,
          score: result.signals.HistoryCheck?.includes("Risk") || result.signals.HistoryCheck?.includes("Fraud") ? 40 : 90,
          color: "text-purple-400"
        },
        {
          name: "Combined Risk",
          status: "Aggregate",
          detail: result.signals.CombinedRisk || "Evaluated",
          icon: AlertCircle,
          score: result.signals.CombinedRisk?.includes("High Risk") ? 35 : 95,
          color: "text-yellow-400"
        }
      ]
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-primary-light mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Health Truth Scoring Engine
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Analysis: {result?.claim_id || "Loading..."}
          </h1>
        </div>

        {!analyzing && (
          <div className="flex space-x-8 items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-900">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-zinc-400">{result?.formula_score || "--"}%</div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Rule Engine</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-zinc-400">{result?.ai_score || "--"}%</div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase mt-1">AI Score</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-extrabold text-primary-light tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {result?.truth_score || "--"}%
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                Final Score
              </span>
            </div>
          </div>
        )}
      </div>

      {/* LOADING */}
      {analyzing ? (
        <div className="glass-card p-20 flex flex-col items-center justify-center">
          <div className="relative mb-10 text-primary-light">
            <div className="absolute inset-0 animate-ping opacity-20 bg-primary-light rounded-full"></div>
          </div>
          <p className="text-lg font-bold text-white mb-2">
            Analyzing Claim...
          </p>
          <p className="text-zinc-500 text-center">
            Running medical fraud detection engine...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* SCORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dimensions.map((dim, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 border-l-4 border-l-primary/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-zinc-950 ${dim.color}`}>
                      <dim.icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase mb-1 block">
                        {dim.status}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {dim.score}%
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm mb-2">{dim.name}</h4>
                  <p className="text-xs text-zinc-400">{dim.detail}</p>
                </motion.div>
              ))}
            </div>

            {/* AI REASONING & EXTRACTED SIGNALS */}
            <div className="glass-card p-6">

              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Rule Engine (Formula) Reasoning</span>
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                {result?.formula_reasoning || "Calculating rules..."}
              </p>

              <h3 className="text-lg font-bold mb-4 border-t border-zinc-800 pt-6 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Amazon Bedrock AI Reasoning</span>
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                {result?.reasoning || "Analyzing claim details and historical patterns..."}
              </p>

              <h3 className="text-lg font-bold mb-4 border-t border-zinc-800 pt-6">
                Complete Signal Breakdown (All 9 Factors)
              </h3>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
                {result?.signals && Object.entries(result.signals).map(([key, value], i) => {
                  const valStr = typeof value === 'string' ? value : JSON.stringify(value);
                  return (
                    <li key={i} className="flex flex-col p-3 rounded-lg bg-zinc-950/50 border border-zinc-900/50">
                      <span className="font-bold text-primary-light uppercase text-[10px] tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={valStr.includes("Risk") || valStr.includes("Suspicious") ? "text-yellow-400" : "text-green-400"}>
                        {valStr}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-2">Final Verdict</h3>

              <p className={`text-lg font-bold ${verdictColor}`}>
                {result?.verdict}
              </p>

              <div className="mt-4 space-y-2">
                <button className="w-full bg-green-600 p-2 rounded">
                  Approve
                </button>
                <button className="w-full bg-yellow-600 p-2 rounded">
                  Review
                </button>
                <button className="w-full bg-red-600 p-2 rounded">
                  Flag
                </button>
              </div>
            </div>

            {/* METADATA */}
            <div className="glass-card p-6 text-xs space-y-2">
              <p>Processing Time: ~4s</p>
              <p>Model: Amazon Nova Pro</p>
              <p>Engine: Hybrid (Rules + AI)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthAnalysisHealth;


// import React, { useState, useEffect } from "react";
// import {
//   ShieldCheck,
//   History,
//   Zap,
//   CheckCircle2,
//   AlertCircle
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { useLocation } from "react-router-dom";
// import { API_ENDPOINTS } from "./api";

// const TruthAnalysisHealth = () => {
//   const [analyzing, setAnalyzing] = useState(true);
//   const [result, setResult] = useState(null);

//   const location = useLocation();
//   const claimId = location.state?.claim_id || "CLM-1777281763"; // fallback for testing

//   useEffect(() => {
//     const fetchAnalysis = async () => {
//       try {
//         const response = await fetch(
//           API_ENDPOINTS.HEALTH_ANALYSIS,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ claim_id: claimId })
//           }
//         );

//         const data = await response.json();
//         let parsed;

//         if (data.body) {
//           parsed = JSON.parse(data.body);
//         } else {
//           parsed = data;
//         }

//         setResult(parsed);
//       } catch (err) {
//         console.error("Error fetching analysis:", err);
//       } finally {
//         setTimeout(() => setAnalyzing(false), 1200);
//       }
//     };

//     fetchAnalysis();
//   }, [claimId]);

//   // 🎨 Verdict color
//   const verdictColor =
//     (result?.verdict === "LEGITIMATE" || result?.verdict === "APPROVE")
//       ? "text-green-400"
//       : (result?.verdict === "SUSPICIOUS" || result?.verdict === "REVIEW")
//         ? "text-yellow-400"
//         : "text-red-400";

//   // 🔥 Dynamic dimensions based on the new 9 signals
//   const dimensions = result?.signals
//     ? [
//         {
//           name: "Amount vs Norms",
//           status: "Financial",
//           detail: result.signals.AmountCheck || "Evaluated",
//           icon: Zap,
//           score: result.signals.AmountCheck?.includes("Risk") || result.signals.AmountCheck?.includes("High") ? 30 : 95,
//           color: "text-blue-400"
//         },
//         {
//           name: "Diagnosis Check",
//           status: "Medical",
//           detail: result.signals.DiagnosisCheck || "Evaluated",
//           icon: ShieldCheck,
//           score: result.signals.DiagnosisCheck?.includes("Mismatch") || result.signals.DiagnosisCheck?.includes("Risk") ? 20 : 98,
//           color: "text-green-400"
//         },
//         {
//           name: "Fraud History",
//           status: "History",
//           detail: result.signals.HistoryCheck || "Evaluated",
//           icon: History,
//           score: result.signals.HistoryCheck?.includes("Risk") || result.signals.HistoryCheck?.includes("Fraud") ? 40 : 90,
//           color: "text-purple-400"
//         },
//         {
//           name: "Combined Risk",
//           status: "Aggregate",
//           detail: result.signals.CombinedRisk || "Evaluated",
//           icon: AlertCircle,
//           score: result.signals.CombinedRisk?.includes("High Risk") ? 35 : 95,
//           color: "text-yellow-400"
//         }
//       ]
//     : [];

//   return (
//     <div className="space-y-8 pb-12">
//       {/* HEADER */}
//       <div className="flex justify-between items-end">
//         <div>
//           <div className="flex items-center space-x-2 text-primary-light mb-2">
//             <ShieldCheck className="w-5 h-5" />
//             <span className="text-xs font-bold uppercase tracking-widest">
//               Health Truth Scoring Engine
//             </span>
//           </div>

//           <h1 className="text-3xl font-bold text-white">
//             Analysis: {result?.claim_id || "Loading..."}
//           </h1>
//         </div>

//         {!analyzing && (
//           <div className="flex space-x-8 items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-900">
//             <div className="flex flex-col items-center">
//               <div className="text-xl font-bold text-zinc-400">{result?.formula_score || "--"}%</div>
//               <span className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Rule Engine</span>
//             </div>
//             <div className="h-8 w-px bg-zinc-800"></div>
//             <div className="flex flex-col items-center">
//               <div className="text-xl font-bold text-zinc-400">{result?.ai_score || "--"}%</div>
//               <span className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Bedrock Truth</span>
//             </div>
//             <div className="h-8 w-px bg-zinc-800"></div>
//             <div className="flex flex-col items-center">
//               <div className="text-4xl font-extrabold text-primary-light tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
//                 {result?.truth_score || "--"}%
//               </div>
//               <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
//                 Final Score
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* LOADING */}
//       {analyzing ? (
//         <div className="glass-card p-20 flex flex-col items-center justify-center">
//           <div className="relative mb-10 text-primary-light">
//             <div className="absolute inset-0 animate-ping opacity-20 bg-primary-light rounded-full"></div>
//           </div>
//           <p className="text-lg font-bold text-white mb-2">
//             Analyzing Claim...
//           </p>
//           <p className="text-zinc-500 text-center">
//             Running medical fraud detection engine...
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* MAIN */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* SCORES */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {dimensions.map((dim, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.1 }}
//                   className="glass-card p-5 border-l-4 border-l-primary/30"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className={`p-2 rounded-lg bg-zinc-950 ${dim.color}`}>
//                       <dim.icon className="w-5 h-5" />
//                     </div>

//                     <div className="text-right">
//                       <span className="text-[10px] uppercase mb-1 block">
//                         {dim.status}
//                       </span>
//                       <span className="text-lg font-bold text-white">
//                         {dim.score}%
//                       </span>
//                     </div>
//                   </div>

//                   <h4 className="font-bold text-sm mb-2">{dim.name}</h4>
//                   <p className="text-xs text-zinc-400">{dim.detail}</p>
//                 </motion.div>
//               ))}
//             </div>

//             {/* AI REASONING & EXTRACTED SIGNALS */}
//             <div className="glass-card p-6">

//               <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
//                 <CheckCircle2 className="w-5 h-5 text-green-400" />
//                 <span>Rule Engine (Formula) Reasoning</span>
//               </h3>
//               <p className="text-sm text-zinc-300 leading-relaxed mb-6">
//                 {result?.formula_reasoning || "Calculating rules..."}
//               </p>

//               <h3 className="text-lg font-bold mb-4 border-t border-zinc-800 pt-6 flex items-center space-x-2">
//                 <Zap className="w-5 h-5 text-blue-400" />
//                 <span>Amazon Bedrock AI Reasoning</span>
//               </h3>
//               <p className="text-sm text-zinc-300 leading-relaxed mb-6">
//                 {result?.reasoning || "Analyzing claim details and historical patterns..."}
//               </p>

//               <h3 className="text-lg font-bold mb-4 border-t border-zinc-800 pt-6">
//                 Complete Signal Breakdown (All 9 Factors)
//               </h3>

//               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
//                 {result?.signals && Object.entries(result.signals).map(([key, value], i) => {
//                   const valStr = typeof value === 'string' ? value : JSON.stringify(value);
//                   return (
//                     <li key={i} className="flex flex-col p-3 rounded-lg bg-zinc-950/50 border border-zinc-900/50">
//                       <span className="font-bold text-primary-light uppercase text-[10px] tracking-wider mb-1">
//                         {key.replace(/([A-Z])/g, ' $1').trim()}
//                       </span>
//                       <span className={valStr.includes("Risk") || valStr.includes("Suspicious") ? "text-yellow-400" : "text-green-400"}>
//                         {valStr}
//                       </span>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           </div>

//           {/* SIDEBAR */}
//           <div className="space-y-6">
//             <div className="glass-card p-6">
//               <h3 className="text-xl font-bold mb-2">Final Verdict</h3>

//               <p className={`text-lg font-bold ${verdictColor}`}>
//                 {result?.verdict}
//               </p>

//               <div className="mt-4 space-y-2">
//                 <button className="w-full bg-green-600 p-2 rounded">
//                   Approve
//                 </button>
//                 <button className="w-full bg-yellow-600 p-2 rounded">
//                   Review
//                 </button>
//                 <button className="w-full bg-red-600 p-2 rounded">
//                   Flag
//                 </button>
//               </div>
//             </div>

//             {/* METADATA */}
//             <div className="glass-card p-6 text-xs space-y-2">
//               <p>Processing Time: ~4s</p>
//               <p>Model: Amazon Nova Pro</p>
//               <p>Engine: Hybrid (Rules + AI)</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TruthAnalysisHealth;
