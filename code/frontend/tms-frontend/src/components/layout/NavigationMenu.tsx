// NavigationMenu.tsx
import React, { useState } from 'react';
// Important: Remplacez par le hook de votre librairie de routing (ex: react-router-dom)
import { useLocation, Link } from 'react-router-dom'; 
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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

interface NavigationMenuProps {
  navigation: NavSection[];
  onHamburgerClick?: () => void;
  collapsed?: boolean;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ navigation = [], onHamburgerClick, collapsed = false }) => {
  const { pathname } = useLocation(); // Hook pour obtenir l'URL actuelle
  const [openSections, setOpenSections] = useState<string[]>(() => {
    // Optionnel : Ouvre la section contenant le lien actif au chargement
    if (!navigation || !Array.isArray(navigation)) return [];
    const activeSection = navigation.find(section => 
      section.items.some(item => pathname.startsWith(item.href))
    );
    return activeSection ? [activeSection.title] : [];
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // Ajout du bouton hamburger pour mobile (en haut du menu)
  // Il doit recevoir une prop ou un callback pour ouvrir la sidebar
  // Ici, on suppose que la fonction onHamburgerClick est passée en prop (à adapter selon AppLayout)

  return (
    <nav className={`flex-1 py-4 space-y-2 ${collapsed ? 'px-1' : 'px-2'}`}>
      {/* ... */}
      {navigation.map((section) => {
        const isOpen = openSections.includes(section.title);
        return (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-700 rounded-md ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? section.title : undefined}
            >
              <span className={collapsed ? 'sr-only' : ''}>{section.title}</span>
              {!collapsed && <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
            </button>
            {isOpen && !collapsed && (
              <div className="mt-1 space-y-1">
                {section.items.map((item) => {
                  // La page est active si l'URL commence par le href de l'item
                  const isCurrent = pathname.startsWith(item.href);
                  return (
                    // Utilisez <Link> au lieu de <a> pour la navigation SPA
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isCurrent
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          isCurrent ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
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
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};