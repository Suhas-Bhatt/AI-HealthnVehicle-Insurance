import React from 'react';
import { Search, Bell, LogOut, User, Sun, Moon, Menu } from 'lucide-react';

/**
 * Header Component: Top navigation bar for search and notifications.
 */
const Header = ({ userName, onLogout, isDark, toggleTheme, toggleSidebar }) => {
  return (
    <header className="h-20 border-b border-zinc-800/30 flex items-center justify-between px-4 md:px-8 bg-zinc-950/20 backdrop-blur-sm sticky top-0 z-40 transition-colors duration-500">
      
      <div className="flex items-center space-x-3 w-full md:w-auto">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={toggleSidebar}
          className="p-2 md:hidden text-zinc-400 hover:text-primary transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 w-full md:w-96 transition-colors duration-500">
          <Search className="w-4 h-4 text-zinc-500 mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Search claims, hospitals..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-zinc-600 text-white"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-primary-light"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border border-zinc-900"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-zinc-800 transition-colors duration-500"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white transition-colors duration-500">{userName || 'Suhas'}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase transition-colors duration-500">Admin Specialist</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center transition-colors duration-500">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-danger transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
