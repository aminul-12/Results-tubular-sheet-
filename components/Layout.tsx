import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Role } from '../types';
import { LogOut, LayoutDashboard, FileText, GraduationCap, Settings, CheckSquare } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-gray-50 no-print">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">UniGrade</h1>
          <p className="text-xs text-slate-400 mt-1">ERP System v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Menu</div>
          
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          
          {user.role === Role.TEACHER && (
             <NavItem icon={<FileText size={20} />} label="My Courses" />
          )}

          {user.role === Role.ADMIN && (
             <NavItem icon={<CheckSquare size={20} />} label="Approvals" />
          )}
          
          {user.role === Role.STUDENT && (
             <NavItem icon={<GraduationCap size={20} />} label="Transcript" />
          )}

          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Settings</div>
          <NavItem icon={<Settings size={20} />} label="Profile" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center">
          <span className="font-bold">UniGrade</span>
          <button onClick={logout}><LogOut size={20}/></button>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </a>
);