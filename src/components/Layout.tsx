import { ReactNode } from 'react';
import { LayoutDashboard, Users, FileText } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'patients' | 'reports';
  onTabChange: (tab: 'dashboard' | 'patients' | 'reports') => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as const, label: 'Pacientes e Consultas', icon: Users },
    { id: 'reports' as const, label: 'Relatórios', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="bg-zinc-900 border-b border-green-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 space-x-4 md:space-x-8 overflow-x-auto">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-green-500 font-semibold text-lg hidden sm:inline">Nutrição Infantil</span>
            </div>
            <div className="flex space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`
                    flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base
                    ${activeTab === id
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'text-gray-400 hover:text-green-500 hover:bg-zinc-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{label}</span>
                  <span className="font-medium sm:hidden text-xs">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        {children}
      </main>
      <footer className="bg-zinc-900 border-t border-green-800 text-center py-4 mt-8">
        <p className="text-gray-400 text-sm">© 2025 Nutricionista Maria Evellyn - Todos os direitos reservados - Desenvolvido por Kauhan Hernandes</p>
      </footer>
    </div>
  );
}
