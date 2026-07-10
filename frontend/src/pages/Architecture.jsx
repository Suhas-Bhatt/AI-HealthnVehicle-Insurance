// import React from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Server, 
//   Database, 
//   Cloud, 
//   Cpu, 
//   Layers, 
//   ScanText,
//   Workflow,
//   Zap,
//   Globe,
//   ShieldCheck
// } from 'lucide-react';

// const Architecture = () => {
//   const awsServices = [
//     {
//       name: 'Amazon Bedrock AI Agents',
//       icon: Cpu,
//       color: 'text-primary',
//       bg: 'bg-primary/10',
//       description: 'Generative AI Foundation Models that calculate Truth Scores, analyze refund histories, and evaluate health data ranges.'
//     },
//     {
//       name: 'LangGraph Orchestrator',
//       icon: Workflow,
//       color: 'text-accent-light',
//       bg: 'bg-accent/10',
//       description: 'Stateful, multi-agent framework orchestrating the flow between Vehicle Claims logic and Health term evaluations.'
//     },
//     {
//       name: 'Amazon Textract (OCR)',
//       icon: ScanText,
//       color: 'text-secondary',
//       bg: 'bg-secondary/10',
//       description: 'Extracts raw text and structured data from uploaded images and scanned PDF documents dynamically.'
//     },
//     {
//       name: 'Amazon S3 & RAG',
//       icon: Database,
//       color: 'text-success',
//       bg: 'bg-success/10',
//       description: 'Document lake storing claims and acting as the knowledge base for the AI Chatbot to retrieve direct answers.'
//     }
//   ];

//   const workflowSteps = [
//     { title: 'Checklist & Upload', desc: 'User completes the document checklist and uploads evidence. Files are securely stored in Amazon S3.' },
//     { title: 'OCR Extraction', desc: 'Amazon Textract scans the random online documents/images and extracts raw string data.' },
//     { title: 'LangGraph Routing', desc: 'LangGraph routes the data to either the Health (Min/Max evaluation) or Vehicle (History/Refund) Agent.' },
//     { title: 'Bedrock Truth Score', desc: 'Bedrock Agents analyze the extracted data against history to generate the final Truth Score and output.' }
//   ];

//   return (
//     <div className="space-y-8 pb-12 max-w-6xl mx-auto">
//       {/* Header */}
//       <div>
//         <div className="flex items-center space-x-2 text-primary-light mb-2">
//           <Server className="w-4 h-4" />
//           <span className="text-[10px] font-bold uppercase tracking-widest">System Internals</span>
//         </div>
//         <h1 className="text-3xl font-bold text-white">System Architecture & LangGraph Workflow</h1>
//         <p className="text-zinc-400 mt-2">A high-level overview of the cloud-native infrastructure powering the AI Insurance Portal.</p>
//       </div>

//       {/* Architectural Diagram Section */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="glass-card p-6"
//       >
//         <h2 className="text-lg font-bold text-white mb-4 flex items-center">
//           <Layers className="w-5 h-5 mr-2 text-primary" />
//           AWS & AI Agent Pipeline
//         </h2>
        
//         {/* Mock Diagram Placeholder - Replace src with actual diagram image */}
//         <div className="w-full h-80 md:h-96 bg-zinc-950/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
//           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
//           <Cloud className="w-16 h-16 text-zinc-700 mb-4 group-hover:text-primary transition-colors duration-500" />
//           <p className="text-zinc-500 font-medium">Insert AWS + LangGraph Architecture Diagram Here</p>
//           <p className="text-xs text-zinc-600 mt-2 max-w-sm text-center">
//             (e.g., S3 {'->'} Textract {'->'} Lambda/LangGraph {'->'} Bedrock Agents)
//           </p>
//         </div>
//       </motion.div>

//       {/* AWS Services Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {awsServices.map((service, idx) => (
//           <motion.div 
//             key={idx}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.1 }}
//             className="glass-card p-6 hover:-translate-y-1 hover:border-zinc-700 transition-all cursor-default"
//           >
//             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.bg}`}>
//               <service.icon className={`w-6 h-6 ${service.color}`} />
//             </div>
//             <h3 className="text-white font-bold mb-2">{service.name}</h3>
//             <p className="text-xs text-zinc-400 leading-relaxed">{service.description}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Workflow Steps Section */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//         className="glass-card p-6 md:p-8"
//       >
//         <h2 className="text-lg font-bold text-white mb-8 flex items-center">
//           <ShieldCheck className="w-5 h-5 mr-2 text-success" />
//           End-to-End Processing Workflow
//         </h2>

//         <div className="relative">
//           {/* Connecting Line (Desktop only) */}
//           <div className="hidden md:block absolute top-6 left-6 right-6 h-[2px] bg-zinc-800/50 z-0"></div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             {workflowSteps.map((step, idx) => (
//               <div key={idx} className="relative z-10 flex flex-col items-center text-center">
//                 <div className="w-12 h-12 rounded-full bg-zinc-900 border border-primary/30 flex items-center justify-center text-primary-light font-bold text-lg mb-4 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
//                   {idx + 1}
//                 </div>
//                 <h4 className="text-white font-bold mb-2">{step.title}</h4>
//                 <p className="text-xs text-zinc-500">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//     </div>
//   );
// };

// export default Architecture;

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Database,
  Cloud,
  Cpu,
  Layers,
  ScanText,
  Zap,
  ShieldCheck,
  Upload,
  ImagePlus,
  X,
  MessageSquare,
  KeyRound,
  FolderOpen,
  GitBranch,
  BarChart3,
  Bot,
  ArrowDown
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const awsServices = [
  {
    name: 'Amazon Bedrock (Nova Pro)',
    icon: Cpu,
    color: 'text-primary',
    bg: 'bg-primary/10',
    description:
      'Foundation model powering the AI agent system. Receives structured prompts with injected CSV reality data to generate Truth Scores, flag anomalies, and reason over claims.'
  },
  {
    name: 'Amazon Textract (OCR)',
    icon: ScanText,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    description:
      'Extracts raw text and structured key-value pairs from uploaded images and scanned documents. Output feeds directly into the Bedrock analysis prompt.'
  },
  {
    name: 'Amazon S3',
    icon: FolderOpen,
    color: 'text-success',
    bg: 'bg-success/10',
    description:
      'Stores original uploaded claim documents, generated FIR/invoice images, and the CSV reality datasets used as ground truth by the Bedrock agent.'
  },
  {
    name: 'AWS Lambda',
    icon: Zap,
    color: 'text-warning',
    bg: 'bg-warning/10',
    description:
      'Serverless compute layer. Separate Lambda functions handle OCR ingestion, truth analysis, chatbot inference, and user authentication — each independently scalable.'
  },
  {
    name: 'Amazon DynamoDB',
    icon: Database,
    color: 'text-accent-light',
    bg: 'bg-accent/10',
    description:
      'Stores user accounts for authentication and persists chatbot session history keyed by session_id + IST timestamp for full conversation continuity.'
  },
  {
    name: 'Amazon API Gateway',
    icon: GitBranch,
    color: 'text-primary-light',
    bg: 'bg-primary/10',
    description:
      'Exposes all backend Lambda functions as secure REST endpoints consumed by the React frontend for uploads, analysis triggers, and chatbot interactions.'
  },
  {
    name: 'AWS IAM & Security',
    icon: KeyRound,
    color: 'text-danger',
    bg: 'bg-danger/10',
    description:
      'Role-based access controls govern Lambda permissions to S3, DynamoDB, Textract, and Bedrock. Ensures each service accesses only what it needs.'
  },
  {
    name: 'Amazon CloudWatch',
    icon: BarChart3,
    color: 'text-zinc-300',
    bg: 'bg-zinc-800',
    description:
      'Monitors Lambda invocations, error rates, and latency across the pipeline. Provides logging for Textract jobs, Bedrock calls, and DynamoDB queries.'
  }
];

const workflows = [
  {
    id: 1,
    title: 'Login & Signup',
    icon: KeyRound,
    color: 'text-primary',
    steps: [
      'User lands on Auth Page (React)',
      'Enters credentials',
      'POST request to Auth Lambda',
      'Lambda queries DynamoDB Users table',
      'Credentials validated server-side',
      'User context returned to frontend',
      'Redirect to Global Dashboard'
    ]
  },
  {
    id: 2,
    title: 'Dashboard → Upload',
    icon: Upload,
    color: 'text-secondary',
    steps: [
      'Global Hub — select Vehicle or Health portal',
      'Module Dashboard loads recent claims',
      'Navigate to "Submit Claim" page',
      'Complete Document Checklist (3 items)',
      'Quick Scan ID or tick manually',
      'Checklist verified → Upload unlocked',
      'Document uploaded & Base64-encoded'
    ]
  },
  {
    id: 3,
    title: 'OCR & Ingestion',
    icon: ScanText,
    color: 'text-warning',
    steps: [
      'User selects document file',
      'Frontend encodes file to Base64',
      'POST to OCR Lambda via API Gateway',
      'Lambda forwards to Amazon Textract',
      'Textract extracts text & key-value pairs',
      'Original file saved to S3 bucket',
      'Extracted JSON returned to frontend',
      'User reviews & edits metadata'
    ]
  },
  {
    id: 4,
    title: 'Bedrock Agent Analysis',
    icon: Bot,
    color: 'text-success',
    steps: [
      'User triggers analysis from review screen',
      'POST to Truth Analysis Lambda',
      'Lambda fetches CSV reality data from S3',
      'CSV data injected into Bedrock prompt',
      'Amazon Nova Pro reasons over claim vs. truth',
      'AI cross-references amounts, dates & patterns',
      'Truth Score + flag categories assigned',
      'Final JSON result sent to frontend',
      'Radar chart & reasoning rendered'
    ]
  },
  {
    id: 5,
    title: 'Chatbot (IST History)',
    icon: MessageSquare,
    color: 'text-accent-light',
    steps: [
      'User sends question in chat UI',
      'POST to Chatbot Lambda (API Gateway)',
      'Lambda loads session history from DynamoDB',
      'Regex detects Claim IDs in message',
      'Relevant S3 CSV data fetched for context',
      'Full context sent to Bedrock Nova Pro',
      'AI generates response with IST timestamp',
      'History row saved (session_id + timestamp)',
      'Response rendered in chat window'
    ]
  }
];

/* ─────────────────────────────────────────────
   IMAGE UPLOAD BOX
───────────────────────────────────────────── */
const ImageUploadBox = ({ label, hint }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={() => !preview && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group
        ${preview
          ? 'border-primary/40 bg-zinc-950'
          : 'border-zinc-700 bg-zinc-950/60 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
        }`}
      style={{ minHeight: '220px' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFile}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <img
              src={preview}
              alt="uploaded diagram"
              className="w-full object-contain rounded-xl"
              style={{ maxHeight: '340px' }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/80 hover:bg-primary text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Replace
              </button>
              <button
                onClick={clear}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center px-2">
              <span className="text-[10px] bg-black/60 text-zinc-400 px-2 py-0.5 rounded truncate max-w-full">{fileName}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-6 py-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <ImagePlus className="w-7 h-7 text-zinc-500 group-hover:text-primary-light transition-colors" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">{label}</p>
            <p className="text-[11px] text-zinc-500 max-w-[180px] leading-relaxed">{hint}</p>
            <p className="text-[10px] text-zinc-600 mt-3">Click to upload · PNG, JPG, PDF</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   WORKFLOW COLUMN
───────────────────────────────────────────── */
const WorkflowColumn = ({ workflow, delay }) => {
  const Icon = workflow.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 flex flex-col"
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800">
        <div className="p-2 rounded-lg bg-zinc-800">
          <Icon className={`w-4 h-4 ${workflow.color}`} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Workflow {workflow.id}</p>
          <h4 className="text-sm font-bold text-white">{workflow.title}</h4>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        {workflow.steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="flex items-start gap-2 w-full">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold mt-0.5 ${workflow.color} border-current bg-zinc-900`}>
                {i + 1}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{step}</p>
            </div>
            {i < workflow.steps.length - 1 && (
              <div className="flex justify-start w-full pl-2 my-0.5">
                <ArrowDown className="w-3 h-3 text-zinc-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const Architecture = () => {
  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-primary-light mb-2">
          <Server className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">System Internals</span>
        </div>
        <h1 className="text-3xl font-bold text-white">System Architecture & Agent Workflows</h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">
          Cloud-native infrastructure built on AWS — powered by a Bedrock-native agent system using Amazon Nova Pro for truth analysis, Textract for OCR, Lambda for serverless compute, and DynamoDB for session persistence.
        </p>
      </div>

      {/* Diagram Upload Boxes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-bold text-white mb-1 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-primary" />
          Architecture Diagrams
        </h2>
        <p className="text-xs text-zinc-500 mb-6">Upload your system architecture and workflow diagrams to display them here.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-primary" /> System Architecture Diagram
            </p>
            <ImageUploadBox
              label="Upload Architecture Diagram"
              hint="Your AWS infrastructure or system design diagram"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-secondary" /> Workflow Diagram
            </p>
            <ImageUploadBox
              label="Upload Workflow Diagram"
              hint="Your end-to-end pipeline or Bedrock agent flow diagram"
            />
          </div>
        </div>
      </motion.div>

      {/* AWS Services */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2 text-primary" />
          AWS Services Used
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {awsServices.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="glass-card p-5 hover:-translate-y-1 hover:border-zinc-700 transition-all cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${service.bg}`}>
                <service.icon className={`w-5 h-5 ${service.color}`} />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{service.name}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow Workflows */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-success" />
          End-to-End Agent Workflows
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Five vertical arrow workflows showing exactly how each request flows from the React frontend through AWS Lambda, Bedrock Nova Pro, and back.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {workflows.map((wf, idx) => (
            <WorkflowColumn key={wf.id} workflow={wf} delay={idx * 0.08} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Architecture;
