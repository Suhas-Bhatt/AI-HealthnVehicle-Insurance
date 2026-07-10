import React from 'react';

/**
 * Footer Component: Information and branding at the bottom of the page.
 */
const Footer = () => {
  return (
    <footer className="mt-auto border-t border-zinc-800/30 bg-zinc-950/20 backdrop-blur-sm py-8 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-zinc-500 text-xs font-medium">
        <div className="flex flex-col md:flex-row items-center md:space-x-8">
          <p>© 2026 AI Insurance. All rights reserved.</p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a href="#" className="hover:text-primary-light transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-light transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-light transition-colors">Compliance</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
          <p>System Status: <span className="text-zinc-300 font-bold uppercase text-[10px]">Operational (AWS Region: ap-south-1)</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
