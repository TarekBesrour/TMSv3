import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Truck,
  FileText,
  Package,
  BarChart3,
  Settings,
  Users,
  Calendar,
  ClipboardList,
  Banknote,
  MessageSquare,
  Wrench,
  User,
  Building2,
  MapPin,
  CreditCard,
  Receipt,
  FileSignature,
  Car,
  PieChart,
  TrendingUp,
  Database,
  Bot,
  Shield
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '../ui/sidebar';

import { Badge } from '../ui/badge';

// Types for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  aiPowered?: boolean;
}

// Types for navigation sections
interface NavSection {
  title: string;
  items: NavItem[];
}

// Navigation structure optimized for TMS
const navigation: NavSection[] = [
  {
    title: "Partenaires & Entitésssss",
    items: [      
      { name: 'Clients', href: '/partners', icon: Building2 },      
      { name: 'Contacts', href: '/contacts', icon: User },
      { name: 'Sites', href: '/sites', icon: MapPin },
    ]
  },
  {
    title: "Commandes & Expéditions",
    items: [
      { name: 'Commandes', href: '/orders', icon: ClipboardList },
      { name: 'Expéditions', href: '/shipments', icon: Truck },
      { name: 'Planification', href: '/planning', icon: Calendar, aiPowered: true, badge: 'IA' },
      { name: 'Tournées', href: '/tours', icon: MapPin },
      { name: 'Disponibilité ressources', href: '/resource-availability', icon: Calendar },
    ]
  },
  {
    title: "Coûts & Facturation",
    items: [
      { name: 'Facturation', href: '/billing', icon: Receipt },
      { name: 'Paiements', href: '/payments', icon: CreditCard },
      { name: 'Comptes bancaires', href: '/bank-accounts', icon: Banknote },
      { name: 'Tarifs', href: '/rates', icon: FileText },
      { name: 'Surcharges', href: '/surcharges', icon: FileText },
      { name: 'Contrats', href: '/contracts', icon: FileSignature },
    ]
  },
  {
    title: "Flotte & Ressources",
    items: [
      { name: 'Flotte', href: '/fleet', icon: Truck },
      { name: 'Véhicules', href: '/vehicles', icon: Car },
      { name: 'Conducteurs', href: '/drivers', icon: User },
      { name: 'Maintenance', href: '/maintenance', icon: Wrench, aiPowered: true, badge: 'IA' },
      { name: 'Équipements', href: '/equipments', icon: Package },
    ]
  },
  {
    title: "Analyse & Reporting",
    items: [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
      { name: 'KPIs', href: '/kpis', icon: PieChart, aiPowered: true, badge: 'IA' },
      { name: 'Prévisions', href: '/forecasting', icon: TrendingUp, aiPowered: true, badge: 'IA' },
      { name: 'Rapports', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    title: "Intégration & Connectivité",
    items: [
      { name: 'Référentiels', href: '/admin/references', icon: Database },
      { name: 'Documents', href: '/documents', icon: FileText, aiPowered: true, badge: 'IA' },
      { name: 'Assistant IA', href: '/assistant', icon: Bot, aiPowered: true },
    ]
  },
  {
    title: "Administration & Sécurité",
    items: [
      { name: 'Paramètres', href: '/settings', icon: Settings },
      { name: 'Utilisateurs', href: '/usermanagement', icon: Users },
      { name: 'Rôles', href: '/rolemanagement', icon: Shield },
      { name: 'Administration', href: '/administration', icon: Settings },
      { name: 'Profil', href: '/profile', icon: User },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sidebar-foreground text-lg font-bold">TMS IA</span>
                <span className="text-sidebar-foreground/70 text-xs">Transport Management</span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider px-3 py-2">
                {section.title}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      className={`
                        group relative transition-all duration-200 hover:bg-sidebar-accent
                        ${isActive(item.href) 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm' 
                          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.href} className="flex items-center space-x-3 px-3 py-2.5">
                        <item.icon 
                          className={`
                            w-5 h-5 transition-colors duration-200
                            ${isActive(item.href) 
                              ? 'text-sidebar-primary-foreground' 
                              : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                            }
                          `} 
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.aiPowered ? "default" : "secondary"}
                                className={`
                                  ml-auto text-xs px-2 py-0.5 
                                  ${item.aiPowered 
                                    ? 'bg-accent text-accent-foreground animate-pulse' 
                                    : 'bg-secondary text-secondary-foreground'
                                  }
                                `}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                        {isActive(item.href) && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground rounded-r-sm" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}