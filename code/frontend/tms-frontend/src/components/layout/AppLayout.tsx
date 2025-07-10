// AppLayout.tsx
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { NavigationMenu } from './NavigationMenu'; // Import du nouveau composant

// ... (vos imports d'icônes et vos types NavSection, NavItem)

// Types for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  badge?: string;
  aiPowered?: boolean;
}

// Types for navigation sections
interface NavSection {
  title: string;
  items: NavItem[];
}
// Les props sont maintenant passées au composant
interface AppLayoutProps {
  children: React.ReactNode;
  navigation: NavSection[];
  // Vous pouvez aussi passer l'utilisateur, etc.
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  // Sidebar content
  const sidebarContent = (
    <div className={`flex flex-col h-0 flex-1 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}> 
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <span className={`text-white text-xl font-bold transition-all duration-300 ${sidebarCollapsed ? 'text-base' : ''}`}>SALMA TMS</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800">
        <NavigationMenu navigation={navigation} onHamburgerClick={() => {
          if (window.innerWidth < 768) {
            setSidebarOpen(true); // mobile
          } else {
            setSidebarCollapsed((prev) => !prev); // desktop
          }
        }} collapsed={sidebarCollapsed} />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button type="button" onClick={() => setSidebarOpen(false)} className="...">
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}> 
        <div className="flex flex-col h-full">{sidebarContent}</div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {/* Bouton menu/hamburger toujours visible */}
          <button
            type="button"
            className="px-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => {
              if (window.innerWidth < 768) {
                setSidebarOpen(true); // mobile
              } else {
                setSidebarCollapsed((prev) => !prev); // desktop
              }
            }}
            title={sidebarCollapsed ? 'Déplier le menu' : 'Réduire le menu'}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            {/* ... (votre barre de recherche et menu profil restent ici) */}
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;