import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import UsersPage from './pages/UsersPage';
import CandidatesPage from './pages/CandidatesPage';
import AISearchPage from './pages/AISearchPage';
import SendEmailPage from './pages/SendEmailPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BrandLogo from './components/BrandLogo';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hr_crm_user') || 'null');
    } catch {
      return null;
    }
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('home');

  const handleLogin = (user) => {
    localStorage.setItem('hr_crm_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('hr_crm_user');
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleUserUpdated = (user) => {
    localStorage.setItem('hr_crm_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pageClass = (pageId) => (activePage === pageId ? 'block' : 'hidden');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 shadow-sm z-30">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-600 hover:text-emerald-700">
            <Menu size={24} />
          </button>
          <div className="ml-3 flex items-center gap-3">
            <BrandLogo compact />
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">

          <div className={pageClass('home')}>
            <DashboardPage currentUser={currentUser} onUserUpdated={handleUserUpdated} />
          </div>

          <div className={pageClass('users')}>
            <UsersPage />
          </div>

          <div className={pageClass('candidates')}>
            <CandidatesPage currentUser={currentUser} />
          </div>

          <div className={pageClass('ai-search')}>
            <AISearchPage currentUser={currentUser} />
          </div>

          <div className={pageClass('send-email')}>
            <SendEmailPage />
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
