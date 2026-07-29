import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import UsersPage from './pages/UsersPage';
import CandidatesPage from './pages/CandidatesPage';
import AISearchPage from './pages/AISearchPage';
import SendEmailPage from './pages/SendEmailPage';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">

        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 shadow-sm z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-blue-600">
            <Menu size={24} />
          </button>
          <div className="ml-3 font-semibold text-slate-800">
            {activePage === 'home' && 'Dashboard'}
            {activePage === 'users' && 'Admin Users'}
            {activePage === 'candidates' && 'Candidates'}
            {activePage === 'ai-search' && 'AI Search'}
            {activePage === 'send-email' && 'Send Email'}
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">

          {activePage === 'home' && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Nexus CRM</span>
              </h1>
              <p className="text-slate-500 max-w-lg mb-8 text-lg">
                Your beautiful, new light-themed dashboard. Use the sidebar to navigate to the live Super Admin Users list and Candidate Data.
              </p>
              <button
                onClick={() => setActivePage('candidates')}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors">
                View Candidates
              </button>
            </div>
          )}

          {activePage === 'users' && <UsersPage />}

          {activePage === 'candidates' && <CandidatesPage />}

          {activePage === 'ai-search' && <AISearchPage />}

          {activePage === 'send-email' && <SendEmailPage />}

        </main>
      </div>
    </div>
  );
}

export default App;
