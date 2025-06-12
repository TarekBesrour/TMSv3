import React, { useState } from 'react';
import { 
  HomeIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

// Types for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
  badge?: string;
  aiPowered?: boolean;
}

// Types for navigation sections
interface NavSection {
  title: string;
  items: NavItem[];
}

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation structure with AI-powered features highlighted
  const navigation: NavSection[] = [
    {
      title: "Général",
      items: [
        { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon, current: true },
        { name: 'Assistant IA', href: '/assistant', icon: ChatBubbleLeftRightIcon, current: false, aiPowered: true },
      ]
    },
    {
      title: "Opérations",
      items: [
        { name: 'Commandes', href: '/orders', icon: ClipboardDocumentListIcon, current: false },
        { name: 'Planification', href: '/planning', icon: CalendarIcon, current: false, aiPowered: true, badge: 'IA' },
        { name: 'Expéditions', href: '/shipments', icon: TruckIcon, current: false },
        { name: 'Documents', href: '/documents', icon: DocumentTextIcon, current: false, aiPowered: true, badge: 'IA' },
      ]
    },
    {
      title: "Ressources",
      items: [
        { name: 'Flotte', href: '/fleet', icon: TruckIcon, current: false },
        { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon, current: false, aiPowered: true, badge: 'IA' },
        { name: 'Partenaires', href: '/partners', icon: UserGroupIcon, current: false },
      ]
    },
    {
      title: "Analyse",
      items: [
        { name: 'KPIs', href: '/kpis', icon: ChartBarIcon, current: false, aiPowered: true, badge: 'IA' },
        { name: 'Prévisions', href: '/forecasting', icon: ChartBarIcon, current: false, aiPowered: true, badge: 'IA' },
        { name: 'Facturation', href: '/billing', icon: BanknotesIcon, current: false },
      ]
    },
    {
      title: "Administration",
      items: [
        { name: 'Paramètres', href: '/settings', icon: CogIcon, current: false },
        { name: 'Référentiels', href: '/references', icon: CubeIcon, current: false },
        { name: 'Utilisateurs', href: '/usermanagement', icon: UserIcon, current: false },        
      ]
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`md:hidden ${sidebarOpen ? 'fixed inset-0 flex z-40' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar panel */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800 transition ease-in-out duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-white text-xl font-bold">TMS IA</span>
          </div>
          
          {/* Navigation */}
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-6">
              {navigation.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  {section.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.aiPowered ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
              <span className="text-white text-xl font-bold">TMS IA</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800">
              <nav className="flex-1 px-2 py-4 space-y-6">
                {navigation.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    {section.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          item.current
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${
                            item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.aiPowered ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Search bar placeholder */}
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Rechercher"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown placeholder */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">JD</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
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
