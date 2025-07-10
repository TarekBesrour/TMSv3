import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  HelpCircle,
  CreditCard,
  Shield
} from 'lucide-react';

interface UserMenuProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  notificationCount?: number;
}

export function UserMenu({ 
  userName = "John Doe", 
  userRole = "Admin",
  userInitials = "JD",
  notificationCount = 0
}: UserMenuProps) {
  return (
    <div className="flex items-center space-x-3">
      {/* Notifications */}
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </Badge>
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole}
                </p>
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Facturation</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Aide & Support</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}