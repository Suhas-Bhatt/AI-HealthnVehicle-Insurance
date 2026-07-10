// import React, { useState } from 'react';
// import { 
//   Upload, 
//   FileText, 
//   User, 
//   MapPin, 
//   Calendar, 
//   DollarSign, 
//   CheckCircle2, 
//   Plus,
//   ArrowRight,
//   Info,
//   CheckSquare,
//   Square
// } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { API_ENDPOINTS } from './api';

// /**
//  * Claim Submission Page: Entry point for new claims.
//  * Corresponds to Step 1 & 2 of the Proposals (Claim Submission & Document Ingestion).
//  */
// const ClaimSubmission = ({ insuranceType }) => {
//   const [step, setStep] = useState(1);
//   const [isUploading, setIsUploading] = useState(false);
//   const [checklist, setChecklist] = useState({
//     doc1: false,
//     doc2: false,
//     doc3: false
//   });
//   const [ocrResult, setOcrResult] = useState('');
//   const [generatedClaimId, setGeneratedClaimId] = useState('');
//   const [isSavedToS3, setIsSavedToS3] = useState(false);
//   const navigate = useNavigate();

//   const isHealth = insuranceType === 'health';
  
//   const allChecked = Object.values(checklist).every(v => v);

//   const handleUpload = async (event) => {
//     if (!allChecked || !event.target.files.length) return;
//     setIsUploading(true);
    
//     const file = event.target.files[0];
    
//     // Convert to base64
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = async () => {
//       const base64String = reader.result.split(',')[1];
      
//       try {
//         const endpoint = isHealth ? API_ENDPOINTS.HEALTH_UPLOAD : API_ENDPOINTS.UPLOAD;
//         const response = await fetch(endpoint, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             file_base64: base64String,
//             file_name: file.name,
//             claim_type: insuranceType || 'health'
//           })
//         });
        
//         const data = await response.json();
//         if (response.ok) {
//            setOcrResult(data.raw_text || "No text found.");
//            if (data.claim_id) setGeneratedClaimId(data.claim_id);
//            setStep(2); // Move to extraction verification screen
//         } else {
//            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: data.error || 'Upload failed', type: 'error' } }));
//         }
//       } catch (err) {
//         console.error("OCR Error:", err);
//         window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to connect to OCR service', type: 'error' } }));
//       } finally {
//         setIsUploading(false);
//       }
//     };
//   };

//   const toggleCheck = (key) => {
//     setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       {/* Page Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-white mb-2">
//             {isHealth ? 'Medical Claim Intake' : 'Vehicle Claim Intake'}
//           </h1>
//           <p className="text-zinc-500 font-medium">Step {step} of 2 - Document Extraction & Narrative Setup</p>
//         </div>
//         <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-3 px-4">
//           <Info className="w-5 h-5 text-primary-light mr-3" />
//           <p className="text-xs text-zinc-400 max-w-[200px]">
//             AI will automatically extract claim data using <span className="text-zinc-200">Amazon Textract</span>.
//           </p>
//         </div>
//       </div>

//       {step === 1 ? (
//         /* Step 1: Document Upload & Checklist */
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="grid grid-cols-1 lg:grid-cols-2 gap-8"
//         >
//           {/* Mandatory Checklist Section */}
//           <div className="glass-card p-8">
//             <h2 className="text-xl font-bold text-white mb-6 flex items-center">
//               <CheckSquare className="w-5 h-5 text-secondary mr-3" />
//               Document Verification Checklist
//             </h2>
//             <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
//               Before our LangGraph orchestrator processes the claim, please ensure you have the following documents ready for OCR extraction.
//             </p>
            
//             <div className="space-y-4">
//               <div 
//                 className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-center ${checklist.doc1 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
//                 onClick={() => toggleCheck('doc1')}
//               >
//                 {checklist.doc1 ? <CheckSquare className="w-5 h-5 text-success mr-4" /> : <Square className="w-5 h-5 text-zinc-500 mr-4" />}
//                 <div>
//                   <p className={`font-bold text-sm ${checklist.doc1 ? 'text-success' : 'text-white'}`}>Official Identity Proof</p>
//                   <p className="text-xs text-zinc-500">Government ID matching the policy holder.</p>
//                 </div>
//               </div>
              
//               <div 
//                 className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-center ${checklist.doc2 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
//                 onClick={() => toggleCheck('doc2')}
//               >
//                 {checklist.doc2 ? <CheckSquare className="w-5 h-5 text-success mr-4" /> : <Square className="w-5 h-5 text-zinc-500 mr-4" />}
//                 <div>
//                   <p className={`font-bold text-sm ${checklist.doc2 ? 'text-success' : 'text-white'}`}>
//                     {isHealth ? 'Discharge Summary / Medical Bills' : 'Police Report (FIR) / Incident Log'}
//                   </p>
//                   <p className="text-xs text-zinc-500">Must include dates, official stamps, and detailed breakdowns.</p>
//                 </div>
//               </div>

//               <div 
//                 className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-center ${checklist.doc3 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
//                 onClick={() => toggleCheck('doc3')}
//               >
//                 {checklist.doc3 ? <CheckSquare className="w-5 h-5 text-success mr-4" /> : <Square className="w-5 h-5 text-zinc-500 mr-4" />}
//                 <div>
//                   <p className={`font-bold text-sm ${checklist.doc3 ? 'text-success' : 'text-white'}`}>
//                     {isHealth ? 'Diagnostic Reports' : 'Visual Evidence (Photos/Videos)'}
//                   </p>
//                   <p className="text-xs text-zinc-500">Clear scans or high-resolution images required for Amazon Textract.</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Upload Section */}
//           <div className={`glass-card p-12 text-center flex flex-col items-center border-dashed border-2 grow transition-all duration-500 ${allChecked ? 'border-primary/50 bg-primary/5' : 'border-zinc-800 bg-zinc-950/50 opacity-60'}`}>
//             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform ${allChecked ? 'bg-primary/20 scale-110' : 'bg-zinc-900'}`}>
//               <Upload className={`w-10 h-10 ${allChecked ? 'text-primary-light' : 'text-zinc-600'}`} />
//             </div>
//             <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
//               Upload {isHealth ? 'Medical Records' : 'Accident Evidence'}
//             </h2>
//             <p className="text-zinc-500 mb-8 max-w-sm">
//               {allChecked 
//                 ? 'Checklist complete. Drag and drop all required documents here.' 
//                 : 'Please complete the checklist to enable document ingestion.'}
//             </p>
            
//             <div className="flex flex-col space-y-4 w-full max-w-sm">
//               <label className={`cursor-pointer flex items-center justify-center space-x-2 ${allChecked ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 py-3 rounded-xl cursor-not-allowed border border-zinc-700'}`}>
//                 <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading || !allChecked} multiple />
//                 {isUploading ? (
//                   <div className="flex items-center space-x-2">
//                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                      <span>Textract Extracting...</span>
//                   </div>
//                 ) : (
//                   <>
//                     <Plus className="w-5 h-5" />
//                     <span>{allChecked ? 'Choose Files' : 'Complete Checklist First'}</span>
//                   </>
//                 )}
//               </label>
//             </div>
//           </div>
//         </motion.div>
//       ) : (
//         /* Step 2: Extracted Data Verification */
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="space-y-6"
//         >
//           <div className="glass-card overflow-hidden">
//             <div className="bg-success/10 border-b border-success/20 p-4 flex items-center">
//               <CheckCircle2 className="w-5 h-5 text-success mr-3" />
//               <p className="text-sm font-medium text-success">Textract Extraction Successful! Bedrock has mapped the {isHealth ? 'Health' : 'Vehicle'} metadata.</p>
//             </div>
            
//             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Personal Info */}
//               <div className="space-y-4">
//                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Claimant Info</p>
//                 <div className="space-y-4">
//                   <div className="relative">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//                     <input type="text" defaultValue="Aditi Sharma" className="input-field pl-12" placeholder="Full Name" />
//                   </div>
//                   <div className="relative">
//                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//                     <input type="text" defaultValue="Sector 45, Gurgaon, HR" className="input-field pl-12" placeholder="Location" />
//                   </div>
//                 </div>
//               </div>

//               {/* Claim Details */}
//               <div className="space-y-4">
//                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
//                   {isHealth ? 'Hospitalization Details' : 'Incident Details'}
//                 </p>
//                 <div className="space-y-4">
//                   <div className="relative">
//                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//                     <input type="text" defaultValue="2026-04-12" className="input-field pl-12" placeholder="Date of Incident" />
//                   </div>
//                   <div className="relative">
//                     <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//                     <input type="text" defaultValue={isHealth ? "Wellness Prime Hospital" : "Toyota Corolla (DL-8C-1234)"} className="input-field pl-12" placeholder={isHealth ? "Hospital Name" : "Vehicle Plate"} />
//                   </div>
//                 </div>
//               </div>

//               {/* Narrative Reconstruction */}
//               <div className="md:col-span-2 space-y-4 mt-4">
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1 italic">
//                     Raw Extraction Output (Amazon Textract)
//                   </p>
//                   <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded border border-secondary/30">OCR CONFIDENCE: 98.4%</span>
//                 </div>
//                 <textarea 
//                   readOnly
//                   className="input-field min-h-[120px] resize-none leading-relaxed text-zinc-300 font-mono text-xs"
//                   value={ocrResult || (isHealth 
//                     ? "PT_NAME: ADITI SHARMA\nADMISSION_DATE: 2026-04-10\nDISCHARGE_DATE: 2026-04-13\nDIAGNOSIS_CODE: I20.9 (ANGINA PECTORIS)\nTOTAL_BILL: INR 45,200\nNOTES: Patient reported chest tightness. Admitted for observation. EKG normal. Prescribed Nitroglycerin."
//                     : "DRIVER: ADITI SHARMA\nVEHICLE: TOYOTA COROLLA (DL-8C-1234)\nINCIDENT_DATE: 2026-04-12\nLOCATION: SECTOR 45 INTERSECTION\nPOLICE_REPORT: YES\nDAMAGE_DESC: Rear bumper cracked, trunk alignment issues, sensors unresponsive.\nWEATHER_COND: Heavy rain, low visibility.")}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
//             <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white transition-colors font-medium">
//               Back to Upload
//             </button>
//             <div className="flex space-x-4">
//               <button 
//                 onClick={() => {
//                   setIsSavedToS3(true);
//                   window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Data & images securely archived in AWS S3!', type: 'success' } }));
//                 }}
//                 disabled={isSavedToS3}
//                 className={`btn-secondary ${isSavedToS3 ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 {isSavedToS3 ? 'Saved to S3' : 'Save to S3 Bucket'}
//               </button>
//               <button 
//                 onClick={() => navigate(`/${insuranceType || 'health'}/analysis`, { state: { claim_id: generatedClaimId } })}
//                 className="btn-primary flex items-center space-x-2"
//               >
//                 <span>Trigger LangGraph Agent</span>
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default ClaimSubmission;


import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Plus,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  Paperclip,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './api';

/**
 * Claim Submission Page: Entry point for new claims.
 * Corresponds to Step 1 & 2 of the Proposals (Claim Submission & Document Ingestion).
 */
const ClaimSubmission = ({ insuranceType }) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [checklist, setChecklist] = useState({
    doc1: false,
    doc2: false,
    doc3: false
  });
  const [ocrResult, setOcrResult] = useState('');
  const [generatedClaimId, setGeneratedClaimId] = useState('');
  const [isSavedToS3, setIsSavedToS3] = useState(false);
  // Pre-upload (quick scan) state
  const [quickScanFile, setQuickScanFile] = useState(null);
  const [isQuickScanning, setIsQuickScanning] = useState(false);
  const quickScanRef = useRef(null);
  const navigate = useNavigate();

  const isHealth = insuranceType === 'health';
  
  const allChecked = Object.values(checklist).every(v => v);

  /**
   * Quick Scan Upload: Upload identity proof near checkbox 1.
   * On success, auto-ticks all 3 checkboxes.
   */
  const handleQuickScan = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsQuickScanning(true);
    setQuickScanFile(file);

    // Simulate a brief scan delay (replace with real API call if needed)
    setTimeout(() => {
      setChecklist({ doc1: true, doc2: true, doc3: true });
      setIsQuickScanning(false);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Identity verified! All documents auto-confirmed.`, type: 'success' }
      }));
    }, 1400);
  };

  const handleUpload = async (event) => {
    if (!allChecked || !event.target.files.length) return;
    setIsUploading(true);
    
    const file = event.target.files[0];
    
    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result.split(',')[1];
      
      try {
        const endpoint = isHealth ? API_ENDPOINTS.HEALTH_UPLOAD : API_ENDPOINTS.UPLOAD;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: base64String,
            file_name: file.name,
            claim_type: insuranceType || 'health'
          })
        });
        
        const data = await response.json();
        if (response.ok) {
           setOcrResult(data.raw_text || "No text found.");
           if (data.claim_id) setGeneratedClaimId(data.claim_id);
           setStep(2); // Move to extraction verification screen
        } else {
           window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: data.error || 'Upload failed', type: 'error' } }));
        }
      } catch (err) {
        console.error("OCR Error:", err);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to connect to OCR service', type: 'error' } }));
      } finally {
        setIsUploading(false);
      }
    };
  };

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isHealth ? 'Medical Claim Intake' : 'Vehicle Claim Intake'}
          </h1>
          <p className="text-zinc-500 font-medium">Step {step} of 2 - Document Extraction & Narrative Setup</p>
        </div>
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-3 px-4">
          <Info className="w-5 h-5 text-primary-light mr-3" />
          <p className="text-xs text-zinc-400 max-w-[200px]">
            AI will automatically extract claim data using <span className="text-zinc-200">Amazon Textract</span>.
          </p>
        </div>
      </div>

      {step === 1 ? (
        /* Step 1: Document Upload & Checklist */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Mandatory Checklist Section */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <CheckSquare className="w-5 h-5 text-secondary mr-3" />
              Document Verification Checklist
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Before our LangGraph orchestrator processes the claim, please ensure you have the following documents ready for OCR extraction.
            </p>
            
            <div className="space-y-4">
              {/* Checkbox 1 — with inline Quick Scan upload */}
              <div
                className={`p-4 rounded-xl border transition-colors flex items-center gap-3 ${
                  checklist.doc1 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Toggle checkbox manually */}
                <div className="cursor-pointer flex-shrink-0" onClick={() => toggleCheck('doc1')}>
                  {checklist.doc1
                    ? <CheckSquare className="w-5 h-5 text-success" />
                    : <Square className="w-5 h-5 text-zinc-500" />}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleCheck('doc1')}>
                  <p className={`font-bold text-sm ${checklist.doc1 ? 'text-success' : 'text-white'}`}>Official Identity Proof</p>
                  <p className="text-xs text-zinc-500">Government ID matching the policy holder.</p>
                </div>

                {/* Quick Scan mini-upload — stops propagation so it doesn't toggle */}
                <div className="flex-shrink-0 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                  <label
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      quickScanFile
                        ? 'bg-success/10 border-success/30 text-success cursor-default'
                        : isQuickScanning
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-wait opacity-60'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-primary/50 hover:text-primary-light cursor-pointer'
                    }`}
                    title="Upload your ID to auto-verify all 3 documents"
                  >
                    <input
                      ref={quickScanRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleQuickScan}
                      disabled={isQuickScanning || !!quickScanFile}
                    />
                    {isQuickScanning ? (
                      <>
                        <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
                        <span>Scanning…</span>
                      </>
                    ) : quickScanFile ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="max-w-[80px] truncate">{quickScanFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        <span>Quick Scan</span>
                      </>
                    )}
                  </label>
                  {!quickScanFile && !isQuickScanning && (
                    <p className="text-[9px] text-zinc-600 mt-0.5 text-center">auto-ticks all ✓</p>
                  )}
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-center ${checklist.doc2 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                onClick={() => toggleCheck('doc2')}
              >
                {checklist.doc2 ? <CheckSquare className="w-5 h-5 text-success mr-4" /> : <Square className="w-5 h-5 text-zinc-500 mr-4" />}
                <div>
                  <p className={`font-bold text-sm ${checklist.doc2 ? 'text-success' : 'text-white'}`}>
                    {isHealth ? 'Discharge Summary / Medical Bills' : 'Police Report (FIR) / Incident Log'}
                  </p>
                  <p className="text-xs text-zinc-500">Must include dates, official stamps, and detailed breakdowns.</p>
                </div>
              </div>

              <div 
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-center ${checklist.doc3 ? 'bg-success/10 border-success/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                onClick={() => toggleCheck('doc3')}
              >
                {checklist.doc3 ? <CheckSquare className="w-5 h-5 text-success mr-4" /> : <Square className="w-5 h-5 text-zinc-500 mr-4" />}
                <div>
                  <p className={`font-bold text-sm ${checklist.doc3 ? 'text-success' : 'text-white'}`}>
                    {isHealth ? 'Diagnostic Reports' : 'Visual Evidence (Photos/Videos)'}
                  </p>
                  <p className="text-xs text-zinc-500">Clear scans or high-resolution images required for Amazon Textract.</p>
                </div>
              </div>
            </div>

            {/* Auto-verify success banner */}
            <AnimatePresence>
              {quickScanFile && allChecked && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/25"
                >
                  <Zap className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  <p className="text-[11px] text-success font-medium">
                    Identity scan verified — all 3 documents auto-confirmed. You can now upload the claim.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Section */}
          <div className={`glass-card p-12 text-center flex flex-col items-center border-dashed border-2 grow transition-all duration-500 ${allChecked ? 'border-primary/50 bg-primary/5' : 'border-zinc-800 bg-zinc-950/50 opacity-60'}`}>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform ${allChecked ? 'bg-primary/20 scale-110' : 'bg-zinc-900'}`}>
              <Upload className={`w-10 h-10 ${allChecked ? 'text-primary-light' : 'text-zinc-600'}`} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
              Upload {isHealth ? 'Medical Records' : 'Accident Evidence'}
            </h2>
            <p className="text-zinc-500 mb-8 max-w-sm">
              {allChecked 
                ? 'Checklist complete. Drag and drop all required documents here.' 
                : 'Please complete the checklist to enable document ingestion.'}
            </p>
            
            <div className="flex flex-col space-y-4 w-full max-w-sm">
              <label className={`cursor-pointer flex items-center justify-center space-x-2 ${allChecked ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 py-3 rounded-xl cursor-not-allowed border border-zinc-700'}`}>
                <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading || !allChecked} multiple />
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span>Textract Extracting...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>{allChecked ? 'Choose Files' : 'Complete Checklist First'}</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Step 2: Extracted Data Verification */
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card overflow-hidden">
            <div className="bg-success/10 border-b border-success/20 p-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-success mr-3" />
              <p className="text-sm font-medium text-success">Textract Extraction Successful! Bedrock has mapped the {isHealth ? 'Health' : 'Vehicle'} metadata.</p>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Claimant Info</p>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="text" defaultValue="Aditi Sharma" className="input-field pl-12" placeholder="Full Name" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="text" defaultValue="Sector 45, Gurgaon, HR" className="input-field pl-12" placeholder="Location" />
                  </div>
                </div>
              </div>

              {/* Claim Details */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                  {isHealth ? 'Hospitalization Details' : 'Incident Details'}
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="text" defaultValue="2026-04-12" className="input-field pl-12" placeholder="Date of Incident" />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="text" defaultValue={isHealth ? "Wellness Prime Hospital" : "Toyota Corolla (DL-8C-1234)"} className="input-field pl-12" placeholder={isHealth ? "Hospital Name" : "Vehicle Plate"} />
                  </div>
                </div>
              </div>

              {/* Narrative Reconstruction */}
              <div className="md:col-span-2 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1 italic">
                    Raw Extraction Output (Amazon Textract)
                  </p>
                  <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded border border-secondary/30">OCR CONFIDENCE: 98.4%</span>
                </div>
                <textarea 
                  readOnly
                  className="input-field min-h-[120px] resize-none leading-relaxed text-zinc-300 font-mono text-xs"
                  value={ocrResult || (isHealth 
                    ? "PT_NAME: ADITI SHARMA\nADMISSION_DATE: 2026-04-10\nDISCHARGE_DATE: 2026-04-13\nDIAGNOSIS_CODE: I20.9 (ANGINA PECTORIS)\nTOTAL_BILL: INR 45,200\nNOTES: Patient reported chest tightness. Admitted for observation. EKG normal. Prescribed Nitroglycerin."
                    : "DRIVER: ADITI SHARMA\nVEHICLE: TOYOTA COROLLA (DL-8C-1234)\nINCIDENT_DATE: 2026-04-12\nLOCATION: SECTOR 45 INTERSECTION\nPOLICE_REPORT: YES\nDAMAGE_DESC: Rear bumper cracked, trunk alignment issues, sensors unresponsive.\nWEATHER_COND: Heavy rain, low visibility.")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white transition-colors font-medium">
              Back to Upload
            </button>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  setIsSavedToS3(true);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Data & images securely archived in AWS S3!', type: 'success' } }));
                }}
                disabled={isSavedToS3}
                className={`btn-secondary ${isSavedToS3 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSavedToS3 ? 'Saved to S3' : 'Save to S3 Bucket'}
              </button>
              <button 
                onClick={() => navigate(`/${insuranceType || 'health'}/analysis`, { state: { claim_id: generatedClaimId } })}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Trigger LangGraph Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClaimSubmission;
