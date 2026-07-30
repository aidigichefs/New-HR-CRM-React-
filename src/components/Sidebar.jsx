import React from 'react';
import { Home, Users, UserSquare2, Menu, X, Settings, LogOut, Bot, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Sidebar({ isOpen, toggleSidebar, activePage, setActivePage, currentUser, onLogout }) {
    const navItems = [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Admin Users', icon: Users },
        { id: 'candidates', label: 'Candidates', icon: UserSquare2 },
        { id: 'ai-search', label: 'AI Search', icon: Bot },
        { id: 'send-email', label: 'Send Email', icon: Mail },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-white px-3 py-2">
                            <BrandLogo compact />
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-white" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActivePage(item.id); if (window.innerWidth < 1024) toggleSidebar(); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-medium text-sm
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Area */}
                <div className="p-4 border-t border-slate-800">
                    <div className="mb-3 rounded-2xl bg-slate-800/70 p-3">
                        <div className="text-sm font-bold text-white truncate">{currentUser?.name || 'HR User'}</div>
                        <div className="text-xs text-slate-400 truncate">{currentUser?.email || ''}</div>
                        <div className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            {currentUser?.role || 'User'}
                        </div>
                    </div>
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                        <Settings size={18} className="text-slate-400" />
                        Settings
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-1">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
